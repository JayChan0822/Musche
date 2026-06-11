export function registerNameLookupFeature(context) {
  const { state } = context;
  const { settings } = state;

  const getNameById = (id, type) => {
    if (!id) return '未选择';

    const list = type === 'instrument' ? settings.instruments
      : type === 'musician' ? settings.musicians
        : type === 'project' ? settings.projects
          : [];

    const item = list.find((entry) => entry.id == id);
    return item ? item.name : (type === 'project' ? '未知项目' : (type === 'instrument' ? '未知乐器' : '未知演奏员'));
  };

  return {
    getNameById,
  };
}
