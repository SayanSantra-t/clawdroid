// ═══════════════════════════════════════════════
// DeviceService — Android device capabilities via Capacitor (non-root)
// ═══════════════════════════════════════════════

export class DeviceService {
  constructor() {
    this._capacitorAvailable = typeof window !== 'undefined' && window.Capacitor;
  }

  async getDeviceInfo() {
    if (this._capacitorAvailable) {
      try {
        const { Device } = await import('@capacitor/device');
        return await Device.getInfo();
      } catch { /* fallback */ }
    }
    return {
      platform: 'web', model: navigator.userAgent, operatingSystem: navigator.platform,
      osVersion: '', manufacturer: '', isVirtual: false, webViewVersion: ''
    };
  }

  async getBatteryInfo() {
    if (this._capacitorAvailable) {
      try {
        const { Device } = await import('@capacitor/device');
        return await Device.getBatteryInfo();
      } catch { /* fallback */ }
    }
    if (navigator.getBattery) {
      const b = await navigator.getBattery();
      return { batteryLevel: b.level, isCharging: b.charging };
    }
    return { batteryLevel: -1, isCharging: false };
  }

  async getNetworkStatus() {
    if (this._capacitorAvailable) {
      try {
        const { Network } = await import('@capacitor/network');
        return await Network.getStatus();
      } catch { /* fallback */ }
    }
    return { connected: navigator.onLine, connectionType: navigator.onLine ? 'wifi' : 'none' };
  }

  async takePhoto() {
    if (this._capacitorAvailable) {
      try {
        const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
        return await Camera.getPhoto({
          quality: 90, allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera
        });
      } catch (e) { throw new Error(`Camera error: ${e.message}`); }
    }
    throw new Error('Camera not available in browser mode');
  }

  async pickPhoto() {
    if (this._capacitorAvailable) {
      try {
        const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
        return await Camera.getPhoto({
          quality: 90, allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Photos
        });
      } catch (e) { throw new Error(`Gallery error: ${e.message}`); }
    }
    // Web fallback — file input
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file'; input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0]; if (!file) return reject(new Error('No file selected'));
        const reader = new FileReader();
        reader.onload = () => resolve({ dataUrl: reader.result });
        reader.readAsDataURL(file);
      };
      input.click();
    });
  }

  async getCurrentPosition() {
    if (this._capacitorAvailable) {
      try {
        const { Geolocation } = await import('@capacitor/geolocation');
        return await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      } catch (e) { throw new Error(`Location error: ${e.message}`); }
    }
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ coords: { latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy } }),
        (err) => reject(new Error(`Location: ${err.message}`))
      );
    });
  }

  async hapticFeedback(type = 'medium') {
    if (this._capacitorAvailable) {
      try {
        const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
        const styles = { light: ImpactStyle.Light, medium: ImpactStyle.Medium, heavy: ImpactStyle.Heavy };
        await Haptics.impact({ style: styles[type] || ImpactStyle.Medium });
      } catch { /* silent */ }
    }
  }

  async shareContent(title, text, url) {
    if (this._capacitorAvailable) {
      try {
        const { Share } = await import('@capacitor/share');
        await Share.share({ title, text, url, dialogTitle: 'Share via ClawDroid' });
      } catch { /* silent */ }
    } else if (navigator.share) {
      await navigator.share({ title, text, url });
    }
  }

  async showToast(message) {
    if (this._capacitorAvailable) {
      try {
        const { Toast } = await import('@capacitor/toast');
        await Toast.show({ text: message, duration: 'short' });
        return;
      } catch { /* fallback */ }
    }
    // Web fallback toast
    const t = document.createElement('div');
    t.textContent = message;
    Object.assign(t.style, {
      position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)',
      background: '#333', color: '#fff', padding: '10px 20px', borderRadius: '8px',
      fontSize: '14px', zIndex: '9999', animation: 'msg-in 0.3s ease-out'
    });
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2500);
  }

  async runTermuxCommand(executable, args = [], background = true) {
    if (this._capacitorAvailable) {
      try {
        const { registerPlugin } = await import('@capacitor/core');
        const Termux = registerPlugin('Termux');
        await Termux.runCommand({ executable, args, background });
        return { success: true, message: `Dispatched ${executable} to Termux.` };
      } catch (e) {
        throw new Error(`Termux error: ${e.message}`);
      }
    }
    throw new Error('Termux API not available in browser mode');
  }
}
