import { reactive } from 'vue';

export function registerProjectInfoFeature(context) {
  const { refs, state, actions } = context;
  const { showProjectInfoModal } = refs;
  const { settings } = state;
  const { triggerTouchHaptic } = actions;

  const projectInfoForm = reactive({
    id: null,
    title: '',
    composer: '',
    arranger: '',
    producer: '',
    mixingEngineer: '',
    mixingStudio: '',
    masteringEngineer: '',
    masteringStudio: '',
    dolbyStudio: '',
    publishedBy: '',
    producedBy: '',
  });

  const openProjectInfoModal = (project) => {
    projectInfoForm.id = project.id;
    projectInfoForm.title = project.title || project.name || '';
    projectInfoForm.composer = project.composer || '';
    projectInfoForm.arranger = project.arranger || '';
    projectInfoForm.producer = project.producer || '';
    projectInfoForm.mixingEngineer = project.mixingEngineer || '';
    projectInfoForm.mixingStudio = project.mixingStudio || '';
    projectInfoForm.masteringEngineer = project.masteringEngineer || '';
    projectInfoForm.masteringStudio = project.masteringStudio || '';
    projectInfoForm.dolbyStudio = project.dolbyStudio || '';
    projectInfoForm.publishedBy = project.publishedBy || '';
    projectInfoForm.producedBy = project.producedBy || '';

    showProjectInfoModal.value = true;
  };

  const saveProjectInfo = () => {
    const target = settings.projects.find((item) => item.id === projectInfoForm.id);
    if (!target) return;

    Object.assign(target, { ...projectInfoForm });
    triggerTouchHaptic('Success');
    showProjectInfoModal.value = false;
  };

  return {
    projectInfoForm,
    openProjectInfoModal,
    saveProjectInfo,
  };
}
