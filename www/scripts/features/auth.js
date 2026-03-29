const { computed } = Vue;

export function registerAuthFeature(context) {
  const { refs, state, utils, services, actions } = context;
  const {
    user,
    showAuthModal,
    authLoading,
    authForm,
    activeDropdown,
    showProfileMenu,
    showMobileMenu,
    tempAvatarUrl,
    tempNickname,
    localDataVersion,
    saveStatus,
    isSyncing,
    itemPool,
    scheduledTasks,
    currentSessionId,
  } = refs;
  const { settings } = state;
  const {
    formatDate,
    ensureItemRecords,
    calculateEstTime,
    generateUniqueId,
  } = utils;
  const {
    pushHistory,
    openAlertModal,
    openConfirmModal,
    triggerTouchHaptic,
    reloadPage,
    setSaveStatus,
  } = actions;
  const {
    storageService,
    supabaseService,
  } = services;

  const userAvatar = computed(() => {
    if (user.value && user.value.user_metadata && user.value.user_metadata.avatar_url) {
      return user.value.user_metadata.avatar_url;
    }
    return null;
  });

  const userDisplayName = computed(() => {
    if (user.value && user.value.user_metadata && user.value.user_metadata.full_name) {
      return user.value.user_metadata.full_name;
    }
    return user.value ? user.value.email.split('@')[0] : 'Guest';
  });

  function initDefaultData(isSidebarOpen) {
    const demoMusicianId = 'M_DEMO_A';
    const demoProjectId = 'P_DEMO_A';
    const demoInstrumentId = 'I_DEMO_A';

    settings.musicians = [{ id: demoMusicianId, name: 'Musician A', defaultRatio: 20, color: '#a855f7', group: '' }];
    settings.projects = [{ id: demoProjectId, name: 'Project A', color: '#eab308', group: '' }];
    settings.instruments = [{ id: demoInstrumentId, name: 'Instrument A', color: '#3b82f6', group: '' }];

    if (settings.sessions.length === 0) {
      settings.sessions = [{ id: 'S_DEFAULT', name: '默认录音日程' }];
    }
    currentSessionId.value = settings.sessions[0].id;

    const demoTaskId = 'T_DEMO_001';
    itemPool.value = [{
      id: demoTaskId,
      name: '演示曲目',
      sessionId: 'S_DEFAULT',
      musicianId: demoMusicianId,
      projectId: demoProjectId,
      instrumentId: demoInstrumentId,
      musicDuration: '03:00',
      estDuration: '01:00:00',
      ratio: 20,
      trackCount: 1,
      records: { musician: {}, project: {}, instrument: {} },
    }];

    const todayStr = formatDate(new Date());
    scheduledTasks.value = [{
      scheduleId: Date.now(),
      templateId: demoTaskId,
      sessionId: 'S_DEFAULT',
      musicianId: demoMusicianId,
      projectId: demoProjectId,
      instrumentId: demoInstrumentId,
      date: todayStr,
      startTime: '10:00',
      estDuration: '01:00:00',
      trackCount: 1,
      ratio: 20,
      musicDuration: '03:00',
      reminderMinutes: 15,
      sound: 'default',
    }];

    if (isSidebarOpen) {
      isSidebarOpen.value = true;
      storageService.setItem('musche_sidebar_open', 'true');
    }
  }

  async function loadCloudData() {
    if (!user.value) return;

    const { data, error } = await supabaseService.loadUserData(user.value.id);
    if (error) throw error;

    if (data && data.content) {
      localDataVersion.value = data.version || 0;
      const content = data.content;

      if (content.pool) itemPool.value = content.pool;
      if (content.tasks) scheduledTasks.value = content.tasks;

      if (content.settings) {
        settings.startHour = content.settings.startHour;
        settings.endHour = content.settings.endHour;
        if (content.settings.sessions) settings.sessions = content.settings.sessions;
        if (content.settings.instruments) settings.instruments = content.settings.instruments;
        if (content.settings.musicians) settings.musicians = content.settings.musicians;
        if (content.settings.projects) settings.projects = content.settings.projects;
        if (content.settings.studios) settings.studios = content.settings.studios;
        if (content.settings.engineers) settings.engineers = content.settings.engineers;
        if (content.settings.operators) settings.operators = content.settings.operators;
        if (content.settings.assistants) settings.assistants = content.settings.assistants;

        if (content.settings.lastSessionId) {
          const exists = settings.sessions.find((session) => session.id === content.settings.lastSessionId);
          currentSessionId.value = exists ? exists.id : settings.sessions[0].id;
        }
      }
      return;
    }

    localDataVersion.value = 0;
    const localData = storageService.loadData('v9_data');
    if (!localData) return;

    const hasRealData = (localData.pool && localData.pool.length > 0) || (localData.tasks && localData.tasks.length > 0);
    if (!hasRealData) return;

    openConfirmModal(
      '数据冲突',
      '检测到您本地有旧数据，而云端是空的。\n\n您希望如何处理？',
      async () => {
        const dataToUpload = {
          pool: localData.pool || [],
          tasks: localData.tasks || [],
          settings: localData.settings || settings,
        };
        const { error: uploadError } = await supabaseService.saveUserData(user.value.id, dataToUpload, 1);

        if (!uploadError) {
          localDataVersion.value = 1;
          openAlertModal('成功', '✅ 本地数据已成功上传！');
        } else {
          openAlertModal('上传失败', uploadError.message);
        }
      },
      false,
      '上传本地数据',
      '放弃本地数据',
    );
  }

  async function saveToCloud(handleManualSync, force = false) {
    if (!user.value) return;

    setSaveStatus('saving');

    try {
      const { data: serverRecord, error: checkError } = await supabaseService.fetchUserDataVersion(user.value.id);
      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      const serverVersion = serverRecord ? serverRecord.version : 0;
      if (serverVersion > localDataVersion.value && !force) {
        setSaveStatus('error');
        triggerTouchHaptic('Error');

        openConfirmModal(
          '⚠ 数据同步冲突',
          '检测到云端有更新的数据（可能您在其他设备进行了操作）。\n\n为了防止数据覆盖，请先同步最新数据。',
          async () => {
            await handleManualSync();
          },
          false,
          '立即同步 (推荐)',
          '暂不处理',
        );
        return;
      }

      const newVersion = serverVersion + 1;
      const dataToSave = {
        pool: itemPool.value,
        tasks: scheduledTasks.value,
        settings: { ...settings, lastSessionId: currentSessionId.value },
      };

      const { error: saveError } = await supabaseService.saveUserData(user.value.id, dataToSave, newVersion);
      if (saveError) throw saveError;

      localDataVersion.value = newVersion;
      setTimeout(() => {
        setSaveStatus('saved');
      }, 500);
    } catch (error) {
      console.error('保存失败', error);
      setSaveStatus('error');
    }
  }

  async function handleLogin() {
    if (!authForm.email || !authForm.password) return openAlertModal('请输入邮箱和密码');
    authLoading.value = true;

    const { data, error } = await supabaseService.signInWithPassword({
      email: authForm.email,
      password: authForm.password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        openAlertModal('登录失败：账号或密码错误');
      } else {
        openAlertModal(`登录失败: ${error.message}`);
      }
    } else {
      user.value = data.user;
      showAuthModal.value = false;
      await loadCloudData();
    }

    authLoading.value = false;
  }

  async function handleRegister() {
    if (!authForm.email || !authForm.password) return openAlertModal('请输入邮箱和密码');
    authLoading.value = true;

    const { data, error } = await supabaseService.signUp({
      email: authForm.email,
      password: authForm.password,
    });

    if (error) {
      openAlertModal(`注册失败: ${error.message}`);
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      openAlertModal('该邮箱已被注册，请直接登录 (若忘记密码请点击找回)。');
    } else {
      openAlertModal('注册成功！\n请检查您的邮箱进行验证，验证后即可登录。');
    }

    authLoading.value = false;
  }

  async function handleResetPwd() {
    if (!authForm.email) return openAlertModal('请先在上方输入您的邮箱地址');

    authLoading.value = true;
    const { error } = await supabaseService.resetPasswordForEmail(authForm.email, {
      redirectTo: window.location.origin,
    });

    if (error) {
      openAlertModal(`发送失败: ${error.message}`);
    } else {
      openAlertModal(`重置邮件已发送至 ${authForm.email}\n请查收邮件并点击链接重设密码。`);
    }
    authLoading.value = false;
  }

  async function updateNickname() {
    if (!user.value) return;
    if (!tempNickname.value.trim()) return openAlertModal('昵称不能为空');

    authLoading.value = true;
    try {
      const { data, error } = await supabaseService.updateUser({
        data: { full_name: tempNickname.value.trim() },
      });
      if (error) throw error;
      user.value = data.user;
    } catch (error) {
      openAlertModal(`更新失败: ${error.message}`);
    } finally {
      authLoading.value = false;
    }
  }

  function handleUserBtnClick() {
    if (user.value) {
      const wasOpen = showProfileMenu.value;
      if (activeDropdown) activeDropdown.value = null;
      showMobileMenu.value = false;
      showProfileMenu.value = !wasOpen;

      if (showProfileMenu.value) {
        tempAvatarUrl.value = userAvatar.value || '';
        tempNickname.value = userDisplayName.value;
      }
    } else {
      showAuthModal.value = true;
    }
  }

  async function updateAvatar() {
    if (!user.value) return;

    const url = tempAvatarUrl.value.trim();
    const { data, error } = await supabaseService.updateUser({
      data: { avatar_url: url },
    });

    if (error) {
      openAlertModal(`更新失败: ${error.message}`);
    } else {
      user.value = data.user;
      openAlertModal('头像已更新！');
    }
  }

  async function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return openAlertModal('图片太大了，请选择 2MB 以下的图片');
    }

    const btnText = document.getElementById('upload-text');
    if (btnText) btnText.innerText = '上传中...';

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.value.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabaseService.uploadAvatar(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabaseService.getAvatarPublicUrl(filePath);
      const publicUrl = data.publicUrl;
      const { data: userData, error: updateError } = await supabaseService.updateUser({
        data: { avatar_url: publicUrl },
      });
      if (updateError) throw updateError;

      user.value = userData.user;
      openAlertModal('头像上传成功！');
    } catch (error) {
      openAlertModal(`上传失败: ${error.message}`);
      console.error(error);
    } finally {
      if (btnText) btnText.innerText = '选择图片...';
      event.target.value = '';
    }
  }

  async function handleLogout() {
    user.value = null;
    try {
      await supabaseService.signOut();
    } catch (error) {
      console.error('Cloud signout failed:', error);
    }

    openAlertModal('已退出账号连接。');
    localDataVersion.value = 0;
    reloadPage();
  }

  function factoryReset() {
    openConfirmModal(
      '恢复出厂设置',
      '⚠确定要清空所有数据吗？\n\n如果当前为登录状态，云端数据也将被永久清除。此操作不可逆！',
      async () => {
        if (user.value) {
          const { error } = await supabaseService.deleteUserData(user.value.id);
          if (error) {
            console.error('Cloud data deletion failed:', error);
            openAlertModal('云端清理失败', '无法删除云端数据，请检查网络或稍后重试。');
          } else {
            openAlertModal('云端数据已清除', '您的所有数据已从云端永久清除。');
          }
        }

        storageService.removeItem('v9_data');
        storageService.removeItem('musche_tour_seen');
        localDataVersion.value = 0;
        reloadPage();
      },
      true,
      '彻底清空',
      '再想想',
    );
  }

  async function handleManualSync() {
    if (!user.value) {
      return openAlertModal('请先登录', '只有登录后才能同步云端数据。');
    }

    if (isSyncing && isSyncing.value) return;
    if (isSyncing) isSyncing.value = true;
    triggerTouchHaptic('Medium');
    try {
      await loadCloudData();
      setTimeout(() => {
        if (isSyncing) isSyncing.value = false;
        triggerTouchHaptic('Success');
      }, 500);
    } catch (error) {
      if (isSyncing) isSyncing.value = false;
      triggerTouchHaptic('Error');
      openAlertModal('同步失败', '网络连接异常或服务不可用。');
    }
  }

  async function bootSessionData(options = {}) {
    const {
      isSidebarOpen,
    } = options;

    const { data } = await supabaseService.getSession();
    if (data.session) {
      user.value = data.session.user;
      await loadCloudData();

      if (itemPool.value.length === 0 && scheduledTasks.value.length === 0) {
        initDefaultData(isSidebarOpen);
      }
    } else {
      const localData = storageService.loadData('v9_data') || {};
      if (localData.settings) {
        settings.startHour = localData.settings.startHour;
        settings.endHour = localData.settings.endHour;
        if (localData.settings.sessions) settings.sessions = localData.settings.sessions;
        if (localData.settings.instruments) settings.instruments = localData.settings.instruments;
        if (localData.settings.musicians) settings.musicians = localData.settings.musicians;
        if (localData.settings.projects) settings.projects = localData.settings.projects;
        if (localData.settings.studios) settings.studios = localData.settings.studios;
        if (localData.settings.engineers) settings.engineers = localData.settings.engineers;
        if (localData.settings.operators) settings.operators = localData.settings.operators;
        if (localData.settings.assistants) settings.assistants = localData.settings.assistants;

        if (localData.settings.lastSessionId) {
          const exists = settings.sessions.find((session) => session.id === localData.settings.lastSessionId);
          currentSessionId.value = exists ? exists.id : settings.sessions[0].id;
        }
      }

      if (localData.pool && localData.pool.length > 0) {
        itemPool.value = localData.pool.map((item) => ensureItemRecords(item));
        scheduledTasks.value = localData.tasks || [];
      } else {
        initDefaultData(isSidebarOpen);
      }
    }

    pushHistory();
  }

  return {
    userAvatar,
    userDisplayName,
    initDefaultData,
    loadCloudData,
    saveToCloud,
    handleLogin,
    handleRegister,
    handleResetPwd,
    updateNickname,
    handleUserBtnClick,
    updateAvatar,
    handleAvatarUpload,
    handleLogout,
    factoryReset,
    handleManualSync,
    bootSessionData,
  };
}
