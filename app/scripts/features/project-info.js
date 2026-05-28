import { reactive } from 'vue';

const PROJECT_INFO_FIELDS = [
  'composer',
  'arranger',
  'producer',
  'mixingEngineer',
  'mixingStudio',
  'masteringEngineer',
  'masteringStudio',
  'dolbyStudio',
  'publishedBy',
  'producedBy',
];

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

    PROJECT_INFO_FIELDS.forEach((field) => {
      projectInfoForm[field] = project[field] || '';
    });

    showProjectInfoModal.value = true;
  };

  const saveProjectInfo = () => {
    const target = settings.projects.find((project) => project.id === projectInfoForm.id);
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
