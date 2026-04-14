package com.bachatbazaarseller

import android.app.Application
import android.preference.PreferenceManager
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.modules.systeminfo.AndroidInfoHelpers

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)

    if (BuildConfig.DEBUG) {
      val prefs = PreferenceManager.getDefaultSharedPreferences(this)
      val key = "debug_http_host"
      val existing = prefs.getString(key, null)
      if (existing.isNullOrEmpty()) {
        val host = AndroidInfoHelpers.getServerHost(this)
        if (host.isNotEmpty() && host != AndroidInfoHelpers.DEVICE_LOCALHOST) {
          prefs.edit().putString(key, host).apply()
        }
      }
    }
  }
}
