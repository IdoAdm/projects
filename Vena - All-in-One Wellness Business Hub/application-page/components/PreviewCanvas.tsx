import React from 'react';

import { supabase } from '../lib/supabaseClient';

import { ProfileConfig } from '../index';

import { HEBREW_TRANSLATIONS, INITIAL_PLACEHOLDER_IMAGE } from '../constants/config';

import AboutCard from './cards/AboutCard';

import ServicesCard from './cards/ServicesCard';

import MembersLoungeCard from './cards/MembersLoungeCard';

import ProfileHeader from './cards/ProfileHeader';

import { DataStatus, PublishStatus } from '../hooks/useProfileConfig';



interface PreviewCanvasProps {

  isPreviewMode: boolean;

  setIsPreviewMode: React.Dispatch<React.SetStateAction<boolean>>;

  config: ProfileConfig;

  isRtl: boolean;

  onValueChange: <K extends keyof ProfileConfig>(key: K, value: ProfileConfig[K]) => void;

  status: DataStatus;

  publishStatus: PublishStatus;

  publishError: string | null;

  onSave: () => Promise<void>;

  onPublish: () => Promise<void>;
  // ADD: New props for the language switcher
  language: 'en' | 'he';
  onLanguageSwitch: () => void;
}

const PreviewCanvas: React.FC<PreviewCanvasProps> = ({

  isPreviewMode,

  setIsPreviewMode,

  config,

  isRtl,

  onValueChange,

  status,

  publishStatus,

  publishError,

  onPublish,

  onSave,

  // ADD: Destructure the new props
  language,

  onLanguageSwitch,

}) => {

  const viewMode: 'edit' | 'view' = isPreviewMode ? 'view' : 'edit';
  const loungeEnabled = config.sectionVisibility?.lounge !== false;

  const handleSave = async () => {

    try {

      await onSave();

    } catch (error) {

      console.error('Error saving profile:', error);

    }

  };

  const handleScrollToLounge = () => {
    if (!loungeEnabled || typeof document === 'undefined') {
      return;
    }
    const target = document.getElementById('members-lounge');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };



  const handlePublish = async () => {

    try {

      await onPublish();

    } catch (error) {

      console.error('Error publishing profile:', error);

    }

  };



  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {

    const file = event.target.files?.[0];

    if (!file) {

      return;

    }



    const fileExt = file.name.split('.').pop();

    const fileName = `${Math.random()}.${fileExt}`;

    const filePath = `${fileName}`;



    const { data, error } = await supabase.storage

      .from('logos')

      .upload(filePath, file);



    if (error) {

      console.error('Error uploading image:', error);

      return;

    }



    const { data: publicUrlData } = supabase.storage

      .from('logos')

      .getPublicUrl(data.path);



    if (publicUrlData) {

      onValueChange('profileImage', publicUrlData.publicUrl);

    }

  };



  const t = (key: string) => {

    if (isRtl && key in HEBREW_TRANSLATIONS) {

      return HEBREW_TRANSLATIONS[key as keyof typeof HEBREW_TRANSLATIONS];

    }

    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

  };



  const renderSection = (sectionId: string) => {

    if (!config.sectionVisibility[sectionId as keyof typeof config.sectionVisibility]) return null;

    

    switch (sectionId) {

      case 'about':

        return (

          <AboutCard

            key="about"

            config={config}

            bio={config.bio}

            onBioChange={(value) => onValueChange('bio', value)}

            isRtl={isRtl}

            t={t}

            mode={viewMode}

          />

        );

      case 'services':

        return (

          <ServicesCard

            key="services"

            config={config}

            services={config.services}

            onServiceChange={(services) => onValueChange('services', services)}

            isRtl={isRtl}

            t={t}

            mode={viewMode}

          />

        );



      case 'lounge':

        return (

          <section

            key="lounge"

            id="members-lounge"

            aria-labelledby="members-lounge-heading"

            className="scroll-mt-24"

          >

            <h2 id="members-lounge-heading" className="sr-only">

              Members Lounge

            </h2>

            <MembersLoungeCard

              config={config}

              lounge={config.lounge}

              isRtl={isRtl}

              mode={viewMode}

            />

          </section>

        );



      default: 

        return null;

    }

  };





  const getSaveButtonText = () => {

    switch (status) {

      case 'saving':

        return 'Saving...';

      case 'success':

        return 'Saved!';

      case 'error':

        return 'Retry Save';

      default:

        return 'Save';

    }

  };



  const landingPageSlug = config.landingPage?.slug?.trim();
  const normalizedLandingPageSlug = landingPageSlug ? landingPageSlug.toLowerCase() : '';
  const isLandingPageLive = Boolean(config.landingPage?.published && normalizedLandingPageSlug);



  const getPublishButtonText = () => {

    if (publishStatus === 'publishing') return 'Publishing...';

    if (publishStatus === 'success') return isLandingPageLive ? 'Published!' : 'Published!';

    if (publishStatus === 'error') return 'Retry Publish';

    return isLandingPageLive ? 'Update Live Page' : 'Publish';

  };



  const publishButtonClasses =

    publishStatus === 'publishing'

      ? 'bg-indigo-400 cursor-not-allowed'

      : publishStatus === 'success'

      ? 'bg-blue-600'

      : publishStatus === 'error'

      ? 'bg-red-600 hover:bg-red-500'

      : isLandingPageLive

      ? 'bg-blue-700 hover:bg-blue-600'

      : 'bg-indigo-600 hover:bg-indigo-500';



  const publishDisabled = publishStatus === 'publishing' || status === 'saving';

  const publishMessageClass =

    publishStatus === 'error'

      ? 'px-3 py-1 text-sm rounded-md shadow bg-red-100 text-red-700'

      : 'px-3 py-1 text-sm rounded-md shadow bg-blue-100 text-blue-700';





  const publishMessage = publishStatus === 'error'

    ? (publishError ?? 'Failed to publish. Please try again.')

    : publishStatus === 'success'

    ? (normalizedLandingPageSlug ? `Landing page published! Live at /${normalizedLandingPageSlug}` : 'Landing page published!')

    : null;



  return (

    <main className="flex-1 h-full overflow-y-auto relative">

      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">

        <div className="flex flex-wrap justify-end gap-2">
          
          {/* ADD: The language switch button here, to the left of the others */}
          <button
            onClick={onLanguageSwitch}
            className="px-4 py-2 bg-slate-800 text-white rounded-md shadow-lg hover:bg-slate-700 transition-colors"
            title={language === 'en' ? "Switch to Hebrew" : "Switch to English"}
          >
            {language === 'en' ? 'עברית' : 'English'}
          </button>

          <button
            onClick={handleScrollToLounge}
            disabled={!loungeEnabled}
            className={`px-4 py-2 rounded-md shadow-lg transition-colors ${
              loungeEnabled
                ? 'bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 text-white hover:shadow-xl hover:shadow-purple-500/40'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
            }`}
            title={
              loungeEnabled
                ? 'Scroll to Members Club section'
                : 'Enable the Members Lounge section to use this shortcut'
            }
          >
            Members Club
          </button>

          <button 

            onClick={handleSave} 

            className={`px-4 py-2 text-white rounded-md shadow-lg transition-colors ${

              status === 'saving' ? 'bg-yellow-500 cursor-not-allowed' :

              status === 'success' ? 'bg-green-500' :

              status === 'error' ? 'bg-red-500 hover:bg-red-400' :

              'bg-green-600 hover:bg-green-500'

            }`}

            disabled={status === 'saving'}

          >

            {getSaveButtonText()}

          </button>

          <button

            onClick={handlePublish}

            className={`px-4 py-2 text-white rounded-md shadow-lg transition-colors ${publishButtonClasses}`}

            disabled={publishDisabled}

          >

            {getPublishButtonText()}

          </button>

          <button

            onClick={() => setIsPreviewMode(!isPreviewMode)}

            className="px-4 py-2 bg-slate-800 text-white rounded-md shadow-lg hover:bg-slate-700 transition-colors"

          >

            {isPreviewMode ? 'Editor' : 'Preview'}

          </button>

        </div>

        {publishMessage && (

          <div className={publishMessageClass}>

            {publishMessage}

          </div>

        )}

        {isLandingPageLive && normalizedLandingPageSlug && (

          <a

            href={`https://app.vena.software/${normalizedLandingPageSlug}`}

            target="_blank"

            rel="noreferrer"

            className="px-3 py-1 text-sm rounded-md shadow bg-white/90 text-blue-600 hover:bg-white transition-colors"

          >

            View live page (new tab)

          </a>

        )}

      </div>

      {status === 'loading' && (

        <div className="absolute inset-0 bg-slate-200/50 dark:bg-slate-900/50 flex items-center justify-center z-30">

          <div className="text-lg font-semibold text-slate-700 dark:text-slate-300">Loading Profile...</div>

        </div>

      )}

      <div dir={isRtl ? 'rtl' : 'ltr'} className={`max-w-7xl mx-auto p-6 md:p-8 lg:p-12 transition-all duration-300 ${config.styles.colorBackground} ${config.styles.backgroundOpacity} min-h-screen`}>

        {/* Professional Header */}

        <header className="mb-12">

          <ProfileHeader

            config={config}

            onValueChange={onValueChange}

            onImageUpload={handleImageUpload}

            isRtl={isRtl}

            initialPlaceholderImage={INITIAL_PLACEHOLDER_IMAGE}

            mode={viewMode}

          />

        </header>



        {/* Main Content Grid */}

        <div className="grid gap-8 md:gap-12 auto-rows-max">

          {config.sections.map(renderSection)}

        </div>



        {/* Modern Footer */}

        <footer className="text-center mt-16 pt-12">

          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-2xl p-8 border border-white/20 dark:border-slate-700/30 transition-all duration-300 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-lg hover:-translate-y-1 transform-gpu">

            <div className="flex justify-center mb-4">

              <img src="/favicon.png" alt="Vena Logo" className="w-10 h-10" />

            </div>

            <p className={`text-slate-500 dark:text-slate-400 ${config.styles.fontBody}`}>

              {t('poweredBy')} <span className="font-semibold text-slate-700 dark:text-slate-300">Vena</span>

            </p>

          </div>

        </footer>

      </div>

    </main>

  );

};



export default PreviewCanvas;




