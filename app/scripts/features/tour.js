export function registerTourFeature(context) {
  const { refs, services, actions } = context;
  const { isMobile, isSidebarOpen, mobileTab, showMobileTaskInput, sidebarScrollRef } = refs;
  const { storageService } = services;
  const actionBag = actions || {};
  const { getWindow = () => window, setTimeoutFn = setTimeout } = actionBag;
  const loadDriver = actionBag.loadDriver || (() => Promise.all([
    import('driver.js'),
    import('driver.js/dist/driver.css'),
  ]).then(([module]) => module.driver));
  let driverObjPromise = null;

  const desktopSteps = [
    {
      popover: {
        title: '欢迎使用 Musche',
        description: '这是一款专为音乐人设计的智能排程工具。<br>已为您预设了演示数据，让我们花 1 分钟了解核心流程。',
        align: 'center',
      },
    },
    {
      element: '#tour-session-select',
      popover: {
        title: '日程切换 (Session)',
        description: '这是“档期管理器”。<br>您可以新建不同的录音档期（如“2025春季录音”），并在此切换。',
        side: 'bottom',
      },
    },
    {
      element: '#sidebar',
      popover: {
        title: '任务池 (Pool)',
        description: '这里存放所有待排程的资源。<br>点击顶部的 <b>REC 录音 / EDIT 编辑</b> 标签可切换分类。',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '#tour-first-stat-card',
      popover: {
        title: '任务卡片',
        description: `
                    这是具体的待排程对象（如 Musician A）。
                    <br>🟢 <b>绿色</b>：已排期
                    <br>🔴 <b>红色</b>：缺时 (需增加排期)
                    <br>🔵 <b>蓝色</b>：录制完成
                    <br>🟠 <b>橙色</b>：进行中
                    <hr style="margin:8px 0; opacity:0.2">
                    <b>长按拖拽</b>：直接将卡片拖到右侧日程表中。
                    <br><b>点击卡片</b>：展开查看具体的曲目列表。
                `,
        side: 'right',
        align: 'center',
      },
    },
    {
      element: '#tour-new-task',
      popover: {
        title: '添加任务',
        description: '点击这里录入新的人员、乐器或项目。<br>支持手动输入或 CSV 批量导入。',
        side: 'bottom',
      },
    },
    {
      element: '#main-content',
      popover: {
        title: '日程表 (Schedule)',
        description: `
                    主工作台，支持<b>周/月</b>视图切换。
                    <br>已为您在“今天”创建了一个演示日程。
                    <hr style="margin:8px 0; opacity:0.2">
                    <b>双击日程块</b>：打开 TrackList 详情页，可记录实际录音时间、拆分任务或自动计算效率倍率。
                `,
        side: 'left',
        align: 'center',
      },
    },
    {
      element: '#tour-view-switch',
      popover: {
        title: '视图切换',
        description: '<b>周视图</b>：精确到分钟的排程操作。<br><b>月视图</b>：宏观查看每日安排和空档。',
        side: 'bottom',
      },
    },
    {
      element: '#tour-sync-btn',
      popover: {
        title: '云端同步',
        description: '登录账号后，数据将自动保存到云端，支持多设备协作。',
        side: 'bottom',
      },
    },
  ];

  const mobileSteps = [
    {
      popover: {
        title: '欢迎使用 Musche',
        description: '专为移动端优化的排程体验。<br>支持手势操作和快速记录。',
        align: 'center',
      },
    },
    {
      element: '#tour-session-select',
      popover: {
        title: '切换档期',
        description: '点击顶部切换不同的录音 Session。',
        side: 'bottom',
      },
    },
    {
      element: '#main-content',
      popover: {
        title: '日程表与手势',
        description: `
                            <b>长按</b>：进入拖拽模式。
                            <br><b>双击</b>：打开详情页记录时间。
                            <br><b>左右滑动</b>：切换日期 (日程表) 或 切换分类 (任务池)。
                        `,
        align: 'center',
      },
    },
    {
      element: '.mobile-header-nav',
      popover: {
        title: '日期导航',
        description: '左右滑动屏幕，或点击这里切换日期。',
        side: 'bottom',
      },
    },
    {
      element: '#main-content',
      popover: {
        title: '日视图',
        description: '<b>点某一天</b>：当天的时间轴从下往上滑入。<br>在日视图里<b>左右滑</b>翻天、<b>下拉</b>关闭，任务可直接拖动和拉伸改时长。',
        align: 'center',
      },
    },
    {
      element: '.mobile-tab-bar',
      popover: {
        title: '底部导航',
        description: '<b>核心功能区</b>：<br><b>任务池</b>：查看待排任务<br><b>添加</b>：快速新建<br><b>日程表</b>：查看当前安排<br><b>搜索</b>：点开才展开输入框',
        side: 'top',
      },
    },
    {
      element: '#sidebar',
      popover: {
        title: '任务池 (Task Pool)',
        description: '这里存放所有待排程的资源。<br>点击上方标签或左右滑动可切换 <b>REC 录音 / EDIT 编辑</b>。<br><b>长按卡片</b>即可拖拽到日程表中。',
        side: 'top',
        align: 'center',
      },
      onHighlightStarted: () => {
        mobileTab.value = 'pool';
        showMobileTaskInput.value = false;
        if (sidebarScrollRef.value) sidebarScrollRef.value.scrollTop = 0;
      },
    },
    {
      element: '#tour-first-stat-card',
      popover: {
        title: '任务卡片',
        description: `
                    这是具体的待排程对象（如 Musician A）。
                    <br>🟢 <b>绿色</b>：已排期
                    <br>🔴 <b>红色</b>：缺时 (需增加排期)
                    <br>🔵 <b>蓝色</b>：录制完成
                    <br>🟠 <b>橙色</b>：进行中
                    <hr style="margin:8px 0; opacity:0.2">
                    <b>长按拖拽</b>：直接将卡片拖到右侧日程表中。
                    <br><b>点击卡片</b>：展开查看具体的曲目列表。
                `,
        side: 'right',
        align: 'center',
      },
    },
    {
      element: '#tour-new-task',
      popover: {
        title: '添加任务',
        description: '点击这里录入新的人员、乐器或项目。<br>支持手动输入或 CSV 批量导入。',
        side: 'bottom',
      },
    },
    {
      // 手机端同步按钮收进了汉堡菜单，这里改指头像——同步状态点就挂在它上面
      element: '#tour-user-btn',
      popover: {
        title: '云端同步',
        description: '登录账号后数据自动保存到云端。<br>头像右上角的小圆点表示同步状态，手动同步在左上角菜单里。',
        side: 'bottom',
        align: 'end',
      },
      onHighlightStarted: () => {
        mobileTab.value = 'schedule';
      },
    },
  ];

  const getDriverObj = () => {
    if (!driverObjPromise) {
      driverObjPromise = loadDriver().then((driver) => driver({
        showProgress: true,
        animate: true,
        allowClose: true,
        doneBtnText: '开始使用',
        nextBtnText: '下一步',
        prevBtnText: '上一步',
      }));
    }
    return driverObjPromise;
  };

  const startTour = async () => {
    storageService.removeItem('musche_sidebar_tour_seen');
    const driverObj = await getDriverObj();

    if (getWindow().innerWidth < 800) {
      mobileTab.value = 'schedule';
      showMobileTaskInput.value = false;
      driverObj.setConfig({ steps: mobileSteps });
      driverObj.drive();
    } else {
      isSidebarOpen.value = true;
      driverObj.setConfig({ steps: desktopSteps });
      setTimeoutFn(() => {
        driverObj.drive();
      }, 400);
    }

    storageService.setItem('musche_tour_seen', 'true');
  };

  const mountTourAutostart = () => {
    const hasSeenTour = storageService.getItem('musche_tour_seen');
    if (!hasSeenTour) {
      setTimeoutFn(() => {
        startTour();
        storageService.setItem('musche_tour_seen', 'true');
      }, 1500);
    }
  };

  return {
    desktopSteps,
    mobileSteps,
    startTour,
    mountTourAutostart,
  };
}
