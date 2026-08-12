// 纯 DOM 手势：分隔条拖拽、轨道行拖拽、自动滚动。与领域逻辑无共享状态，仅共享 trackListData。
// 从 track-list.js 抽取（2026-08 模块化重构 P2b）。跨模块回调 syncTrackItemScheduleSection 由依赖注入。
export function createTrackListDragHandlers(deps) {
  const {
    trackListData,
    trackListContainerRef,
    draggingSectionIndex,
    isMobile,
    isDark,
    moveDivider,
    pushHistory,
    syncTrackItemScheduleSection,
  } = deps;

  let dividerDragState = null;
  let trackDragTimer = null;
  let trackDragState = null;
  let trackListScrollTimer = null;

  const startDividerDrag = (event, sectionIndex) => {
    if (dividerDragState) return;
    const isTouch = event.type === 'touchstart';
    if (event.cancelable) event.preventDefault();

    const triggerEl = event.currentTarget;
    const targetEl = triggerEl.closest('.group\\/divider');
    const actualTarget = targetEl || triggerEl;

    const rect = actualTarget.getBoundingClientRect();
    const clientY = isTouch ? event.touches[0].clientY : event.clientY;
    const container = trackListContainerRef.value;
    const initialScrollTop = container ? container.scrollTop : 0;
    container?.classList.add('divider-drag-active');

    const taskEls = Array.from(container.querySelectorAll('.track-card'));
    const taskHeights = taskEls.map((el) => {
      const style = window.getComputedStyle(el);
      return el.offsetHeight + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
    });

    const dividerStyle = window.getComputedStyle(targetEl);
    const ghostHeight = targetEl.offsetHeight +
      parseFloat(dividerStyle.marginTop) +
      parseFloat(dividerStyle.marginBottom);

    let startIndex = trackListData.value.items.findIndex(
      (item) => item.sectionIndex === sectionIndex,
    );
    if (startIndex === -1) startIndex = trackListData.value.items.length;

    const ghost = actualTarget.cloneNode(true);
    Object.assign(ghost.style, {
      position: 'fixed',
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      zIndex: '9999',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      transform: 'none',
      transition: 'none',
      pointerEvents: 'none',
      opacity: '1',
    });
    document.body.appendChild(ghost);

    draggingSectionIndex.value = sectionIndex;

    dividerDragState = {
      targetEl: actualTarget,
      ghost,
      ghostHeight,
      taskEls,
      fingerOffset: clientY - rect.top,
      lastClientY: clientY,
      lastScrollTop: initialScrollTop,
      cumulativeDelta: 0,
      taskHeights,
      virtualIndex: startIndex,
      startIndex,
      sectionIndex,
    };

    if (isTouch) {
      window.addEventListener('touchmove', onDividerDragMove, { passive: false });
      window.addEventListener('touchend', onDividerDragEnd);
      window.addEventListener('touchcancel', onDividerDragEnd);
    } else {
      window.addEventListener('mousemove', onDividerDragMove);
      window.addEventListener('mouseup', onDividerDragEnd);
    }
  };

  const onDividerDragMove = (event) => {
    if (!dividerDragState) return;
    if (event.cancelable) event.preventDefault();

    const clientY = event.type.includes('touch') ? event.touches[0].clientY : event.clientY;
    const newTop = clientY - dividerDragState.fingerOffset;
    dividerDragState.ghost.style.top = `${newTop}px`;

    const container = trackListContainerRef.value;
    const currentScrollTop = container ? container.scrollTop : 0;
    const dy = clientY - dividerDragState.lastClientY;
    const dScroll = currentScrollTop - dividerDragState.lastScrollTop;

    dividerDragState.lastClientY = clientY;
    dividerDragState.lastScrollTop = currentScrollTop;
    dividerDragState.cumulativeDelta += dy + dScroll;

    const { taskHeights, startIndex, ghostHeight, taskEls } = dividerDragState;
    let indexChanged = false;

    while (dividerDragState.cumulativeDelta < 0) {
      if (dividerDragState.virtualIndex <= 0) break;
      const targetIndex = dividerDragState.virtualIndex - 1;
      const threshold = taskHeights[targetIndex];
      if (!threshold || threshold < 10) break;

      if (dividerDragState.cumulativeDelta < -threshold) {
        dividerDragState.cumulativeDelta += threshold;
        dividerDragState.virtualIndex--;
        indexChanged = true;
      } else {
        break;
      }
    }

    while (dividerDragState.cumulativeDelta > 0) {
      if (dividerDragState.virtualIndex >= taskHeights.length) break;
      const targetIndex = dividerDragState.virtualIndex;
      const threshold = taskHeights[targetIndex];
      if (!threshold || threshold < 10) break;

      if (dividerDragState.cumulativeDelta > threshold) {
        dividerDragState.cumulativeDelta -= threshold;
        dividerDragState.virtualIndex++;
        indexChanged = true;
      } else {
        break;
      }
    }

    if (indexChanged || isMobile.value) {
      const virtualIndex = dividerDragState.virtualIndex;

      taskEls.forEach((el, index) => {
        let translateY = 0;
        if (virtualIndex > startIndex) {
          if (index >= startIndex && index < virtualIndex) translateY = -ghostHeight;
        } else if (virtualIndex < startIndex) {
          if (index >= virtualIndex && index < startIndex) translateY = ghostHeight;
        }

        if (translateY !== 0) {
          el.style.transform = `translateY(${translateY}px)`;
          el.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)';
        } else {
          el.style.transform = '';
          el.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)';
        }
      });
    }

    handleTrackListAutoScroll(clientY);
  };

  const onDividerDragEnd = () => {
    const completedDrag = dividerDragState;
    dividerDragState = null;
    draggingSectionIndex.value = null;
    stopTrackListAutoScroll();

    window.removeEventListener('touchmove', onDividerDragMove);
    window.removeEventListener('touchend', onDividerDragEnd);
    window.removeEventListener('touchcancel', onDividerDragEnd);
    window.removeEventListener('mousemove', onDividerDragMove);
    window.removeEventListener('mouseup', onDividerDragEnd);

    if (!completedDrag) return;

    const clearTaskTransforms = () => {
      completedDrag.taskEls.forEach((el) => {
        el.style.transition = 'none';
        el.style.transform = '';
      });
    };

    const cleanupVisuals = () => {
      const currentTaskEls = Array.from(
        trackListContainerRef.value?.querySelectorAll('.track-card') || [],
      );
      const taskEls = new Set([...completedDrag.taskEls, ...currentTaskEls]);
      taskEls.forEach((el) => {
        if (!el.style.transform) el.style.transition = '';
      });

      if (completedDrag.targetEl) completedDrag.targetEl.style.opacity = '';
      const currentDividers = trackListContainerRef.value?.querySelectorAll(
        `[id="sec-divider-${completedDrag.sectionIndex}"]`,
      ) || [];
      currentDividers.forEach((divider) => {
        divider.style.opacity = '';
      });
      if (completedDrag.ghost && document.body.contains(completedDrag.ghost)) {
        document.body.removeChild(completedDrag.ghost);
      }
      trackListContainerRef.value?.classList.remove('divider-drag-active');
    };

    const { sectionIndex, startIndex, virtualIndex } = completedDrag;
    if (virtualIndex === startIndex) {
      clearTaskTransforms();
      cleanupVisuals();
      return;
    }

    const diff = virtualIndex - startIndex;
    const direction = diff > 0 ? 'down' : 'up';
    const moves = Math.abs(diff);

    for (let index = 0; index < moves; index++) {
      moveDivider(sectionIndex, direction, false);
    }
    pushHistory();
    // 与数据提交保持在同一事件栈中清掉预览位移。Vue 会在浏览器绘制前完成
    // DOM 重排，避免最终布局再叠加一次旧 translateY。
    clearTaskTransforms();

    // 给 Vue / TransitionGroup 两帧完成节点交接；期间保留 ghost 并禁用列表过渡，
    // 避免旧位置短暂重现或新 divider 淡入造成闪烁。
    requestAnimationFrame(() => {
      requestAnimationFrame(cleanupVisuals);
    });
  };

  const handleTrackListAutoScroll = (clientY) => {
    const container = trackListContainerRef.value;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const edgeSize = 60;
    const maxSpeed = 15;

    stopTrackListAutoScroll();

    let scrollSpeed = 0;
    if (clientY < rect.top + edgeSize && clientY > rect.top - 50) {
      const intensity = Math.max(0, (rect.top + edgeSize - clientY) / edgeSize);
      scrollSpeed = -maxSpeed * intensity;
    } else if (clientY > rect.bottom - edgeSize && clientY < rect.bottom + 50) {
      const intensity = Math.max(0, (clientY - (rect.bottom - edgeSize)) / edgeSize);
      scrollSpeed = maxSpeed * intensity;
    }

    if (scrollSpeed !== 0) {
      trackListScrollTimer = requestAnimationFrame(function scrollLoop() {
        if (scrollSpeed !== 0 && container) {
          container.scrollTop += scrollSpeed;
          trackListScrollTimer = requestAnimationFrame(scrollLoop);
        }
      });
    }
  };

  const stopTrackListAutoScroll = () => {
    if (trackListScrollTimer) {
      cancelAnimationFrame(trackListScrollTimer);
      trackListScrollTimer = null;
    }
  };

  const startTrackDrag = (event, item) => {
    if (event.target.closest('input, button, select, i.fa-trash-can, i.fa-scissors, i.fa-eraser, .cursor-pointer')) {
      return;
    }

    if (trackDragState || dividerDragState) return;

    const isTouch = event.type === 'touchstart';
    const triggerEl = event.currentTarget;
    const touch = isTouch ? event.touches[0] : event;

    const executeDrag = () => {
      triggerEl.style.setProperty('opacity', '0', 'important');

      const rect = triggerEl.getBoundingClientRect();
      const container = trackListContainerRef.value;
      const initialScrollTop = container ? container.scrollTop : 0;
      const allMovableEls = Array.from(container.querySelectorAll('.track-card, .group\\/divider'));
      const domStartIndex = allMovableEls.indexOf(triggerEl);
      if (domStartIndex === -1) return;
      container.classList.add('track-drag-active');

      const dataStartIndex = trackListData.value.items.findIndex((listItem) => listItem.id === item.id);
      const elementHeights = allMovableEls.map((element) => {
        const style = window.getComputedStyle(element);
        return element.offsetHeight + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
      });

      const ghost = triggerEl.cloneNode(true);
      ghost.style.opacity = '1';
      ghost.classList.remove('hover:border-white/10', 'group');
      Object.assign(ghost.style, {
        position: 'fixed',
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        zIndex: '10000',
        backgroundColor: isDark.value ? '#2c2c2e' : '#F4F4F5',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
        transform: 'scale(1.02)',
        transition: 'none',
        pointerEvents: 'none',
        borderRadius: '8px',
      });
      document.body.appendChild(ghost);

      trackDragState = {
        item,
        targetEl: triggerEl,
        ghost,
        allMovableEls,
        elementHeights,
        itemHeight: elementHeights[domStartIndex],
        fingerOffset: touch.clientY - rect.top,
        lastClientY: touch.clientY,
        lastScrollTop: initialScrollTop,
        cumulativeDelta: 0,
        domStartIndex,
        virtualDomIndex: domStartIndex,
        dataStartIndex,
        virtualDataIndex: dataStartIndex,
      };

    };

    if (isTouch) {
      trackDragTimer = setTimeout(() => executeDrag(), 300);
      trackDragState = { preStartX: touch.clientX, preStartY: touch.clientY };
      window.addEventListener('touchmove', onTrackDragMove, { passive: false });
      window.addEventListener('touchend', onTrackDragEnd);
      window.addEventListener('touchcancel', onTrackDragEnd);
    } else {
      event.preventDefault();
      executeDrag();
      window.addEventListener('mousemove', onTrackDragMove);
      window.addEventListener('mouseup', onTrackDragEnd);
    }
  };

  const onTrackDragMove = (event) => {
    if (!trackDragState || !trackDragState.ghost) {
      if (trackDragTimer && event.type === 'touchmove') {
        const touch = event.touches[0];
        const moveY = Math.abs(touch.clientY - trackDragState.preStartY);
        if (moveY > 10) {
          clearTimeout(trackDragTimer);
          trackDragTimer = null;
          trackDragState = null;
        }
      }
      return;
    }

    if (event.cancelable) event.preventDefault();

    const clientY = event.type.includes('touch') ? event.touches[0].clientY : event.clientY;
    const {
      ghost,
      fingerOffset,
      lastClientY,
      lastScrollTop,
      itemHeight,
      elementHeights,
      allMovableEls,
    } = trackDragState;

    ghost.style.top = `${clientY - fingerOffset}px`;

    const container = trackListContainerRef.value;
    const currentScrollTop = container ? container.scrollTop : 0;
    const dy = clientY - lastClientY;
    const dScroll = currentScrollTop - lastScrollTop;

    trackDragState.lastClientY = clientY;
    trackDragState.lastScrollTop = currentScrollTop;
    trackDragState.cumulativeDelta += dy + dScroll;

    let indexChanged = false;

    while (trackDragState.cumulativeDelta > 0) {
      if (trackDragState.virtualDomIndex >= elementHeights.length - 1) break;

      const nextDomIndex = trackDragState.virtualDomIndex + 1;
      const threshold = elementHeights[nextDomIndex] / 2 + itemHeight / 2;

      if (trackDragState.cumulativeDelta > threshold) {
        trackDragState.cumulativeDelta -= elementHeights[nextDomIndex];
        trackDragState.virtualDomIndex++;

        if (allMovableEls[nextDomIndex].classList.contains('track-card')) {
          trackDragState.virtualDataIndex++;
        }

        indexChanged = true;
      } else {
        break;
      }
    }

    while (trackDragState.cumulativeDelta < 0) {
      if (trackDragState.virtualDomIndex <= 0) break;

      const prevDomIndex = trackDragState.virtualDomIndex - 1;
      const threshold = elementHeights[prevDomIndex] / 2 + itemHeight / 2;

      if (trackDragState.cumulativeDelta < -threshold) {
        trackDragState.cumulativeDelta += elementHeights[prevDomIndex];
        trackDragState.virtualDomIndex--;

        if (allMovableEls[prevDomIndex].classList.contains('track-card')) {
          trackDragState.virtualDataIndex--;
        }

        indexChanged = true;
      } else {
        break;
      }
    }

    const virtualDomIndex = trackDragState.virtualDomIndex;
    const domStartIndex = trackDragState.domStartIndex;

    trackDragState.allMovableEls.forEach((element, index) => {
      if (index === domStartIndex) return;

      let translateY = 0;
      if (domStartIndex < virtualDomIndex) {
        if (index > domStartIndex && index <= virtualDomIndex) translateY = -itemHeight;
      } else if (domStartIndex > virtualDomIndex) {
        if (index >= virtualDomIndex && index < domStartIndex) translateY = itemHeight;
      }

      element.style.transform = translateY !== 0 ? `translate3d(0, ${translateY}px, 0)` : '';
      element.style.transition = 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)';
    });

    handleTrackListAutoScroll(clientY);
  };

  const onTrackDragEnd = () => {
    if (trackDragTimer) {
      clearTimeout(trackDragTimer);
      trackDragTimer = null;
    }

    if (!trackDragState || !trackDragState.ghost) {
      trackDragState = null;
      trackListContainerRef.value?.classList.remove('track-drag-active');
      window.removeEventListener('touchmove', onTrackDragMove);
      window.removeEventListener('touchend', onTrackDragEnd);
      window.removeEventListener('touchcancel', onTrackDragEnd);
      return;
    }

    const {
      targetEl,
      ghost,
      allMovableEls,
      dataStartIndex,
      virtualDataIndex,
      domStartIndex,
      virtualDomIndex,
      item,
    } = trackDragState;

    if (targetEl) targetEl.style.opacity = '';
    if (ghost && document.body.contains(ghost)) document.body.removeChild(ghost);

    allMovableEls.forEach((element) => {
      element.style.transform = '';
      element.style.transition = '';
    });
    stopTrackListAutoScroll();

    const didMove = domStartIndex !== virtualDomIndex || dataStartIndex !== virtualDataIndex;
    if (didMove) {
      const items = trackListData.value.items;
      const previousSectionIndex = item.sectionIndex;

      if (dataStartIndex !== virtualDataIndex) {
        items.splice(dataStartIndex, 1);
        items.splice(virtualDataIndex, 0, item);
      }

      const tempDomArray = [...allMovableEls];
      const movedEl = tempDomArray.splice(domStartIndex, 1)[0];
      tempDomArray.splice(virtualDomIndex, 0, movedEl);

      const prevEl = tempDomArray[virtualDomIndex - 1];

      if (prevEl && prevEl.id && prevEl.id.startsWith('sec-divider-')) {
        item.sectionIndex = parseInt(prevEl.id.replace('sec-divider-', ''), 10);
      } else if (items.length > 1) {
        if (virtualDataIndex === 0) {
          item.sectionIndex = items[1].sectionIndex;
        } else {
          item.sectionIndex = items[virtualDataIndex - 1].sectionIndex;
        }
      }

      syncTrackItemScheduleSection(item, previousSectionIndex);
      pushHistory();
    }

    trackDragState = null;

    const releaseTransitionGuard = () => {
      trackListContainerRef.value?.classList.remove('track-drag-active');
    };
    if (didMove) {
      requestAnimationFrame(() => {
        requestAnimationFrame(releaseTransitionGuard);
      });
    } else {
      releaseTransitionGuard();
    }

    window.removeEventListener('touchmove', onTrackDragMove);
    window.removeEventListener('touchend', onTrackDragEnd);
    window.removeEventListener('touchcancel', onTrackDragEnd);
    window.removeEventListener('mousemove', onTrackDragMove);
    window.removeEventListener('mouseup', onTrackDragEnd);
  };

  return {
    startDividerDrag,
    onDividerDragMove,
    onDividerDragEnd,
    handleTrackListAutoScroll,
    stopTrackListAutoScroll,
    startTrackDrag,
    onTrackDragMove,
    onTrackDragEnd,
    isDividerDragging: () => !!dividerDragState,
  };
}
