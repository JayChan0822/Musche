import { nextTick as vueNextTick } from 'vue';

function defaultReadAsDataURL(file, onLoad) {
  const reader = new FileReader();
  reader.onload = onLoad;
  reader.readAsDataURL(file);
}

export function registerAvatarCropFeature(context) {
  const { refs, services, actions } = context;
  const {
    showCropModal,
    cropImgSrc,
    cropImgRef,
    authLoading,
    user,
  } = refs;
  const { supabaseService } = services;
  const {
    openAlertModal,
    loadCropper,
    readAsDataURL = defaultReadAsDataURL,
    nextTick = vueNextTick,
    getNow = () => Date.now(),
    logError = (error) => console.error(error),
  } = actions;

  let cropper = null;

  const onFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      return openAlertModal('图片太大了，请选择 20MB 以下的图片');
    }

    readAsDataURL(file, (e) => {
      cropImgSrc.value = e.target.result;
      showCropModal.value = true;

      nextTick(() => {
        if (cropper) {
          cropper.destroy();
          cropper = null;
        }

        const imgEl = cropImgRef.value;
        if (!imgEl) return;

        let isInitialized = false;
        const initCropper = async () => {
          if (isInitialized) return;
          isInitialized = true;

          const cropperModule = await loadCropper();
          const CropperClass = cropperModule.default || cropperModule;
          cropper = new CropperClass(imgEl, {
            aspectRatio: 1,
            viewMode: 1,
            dragMode: 'move',
            autoCropArea: 1,
            background: false,
            checkCrossOrigin: false,
            ready() {},
          });
        };

        if (imgEl.complete && imgEl.naturalWidth > 0) {
          initCropper();
        } else {
          imgEl.addEventListener('load', initCropper, { once: true });
        }
      });
    });
    event.target.value = '';
  };

  const cancelCrop = () => {
    showCropModal.value = false;
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }
  };

  const confirmCrop = () => {
    if (!cropper) return;

    const canvas = cropper.getCroppedCanvas({
      width: 300,
      height: 300,
    });

    if (!canvas) {
      return openAlertModal('裁剪失败：未能获取到图片内容。\n请检查是否已引入 cropper.min.css 样式文件。');
    }

    authLoading.value = true;

    canvas.toBlob(async (blob) => {
      if (!blob) {
        authLoading.value = false;
        return openAlertModal('生成图片文件失败');
      }

      try {
        const fileName = `${user.value.id}-${getNow()}.webp`;
        const filePath = `${fileName}`;
        const { error: uploadError } = await supabaseService.uploadAvatar(filePath, blob, {
          contentType: 'image/webp',
          upsert: true,
        });

        if (uploadError) throw uploadError;

        const { data } = supabaseService.getAvatarPublicUrl(filePath);
        const publicUrl = data.publicUrl;

        const { error: updateError } = await supabaseService.updateUser({
          data: { avatar_url: publicUrl },
        });

        if (updateError) throw updateError;

        user.value = (await supabaseService.getUser()).data.user;
        cancelCrop();
        openAlertModal('头像更新成功！');
      } catch (error) {
        logError(error);
        openAlertModal(`上传失败: ${error.message}`);
      } finally {
        authLoading.value = false;
      }
    }, 'image/webp', 0.6);
  };

  return {
    onFileSelect,
    cancelCrop,
    confirmCrop,
  };
}
