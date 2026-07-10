package com.walletwatcher.pro;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebSettings;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.JavascriptInterface;
import android.content.Intent;
import android.net.Uri;
import android.util.Log;
import android.os.Build;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.PluginHandle;
import com.getcapacitor.Plugin;

public class MainActivity extends BridgeActivity {
    
    private static final String TAG = "WalletWatcherPro";
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Enable remote debugging in debug builds
        if (BuildConfig.DEBUG) {
            WebView.setWebContentsDebuggingEnabled(true);
        }
        
        // Handle deep links
        handleIntent(getIntent());
    }
    
    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleIntent(intent);
    }
    
    private void handleIntent(Intent intent) {
        if (intent != null && intent.getData() != null) {
            Uri data = intent.getData();
            Log.d(TAG, "Deep link received: " + data.toString());
            
            // Handle walletwatcher://wallet?address=...&network=...
            if ("walletwatcher".equals(data.getScheme())) {
                String address = data.getQueryParameter("address");
                String network = data.getQueryParameter("network");
                String label = data.getQueryParameter("label");
                
                if (address != null) {
                    // Pass to web view via JavaScript
                    String js = String.format(
                        "javascript:if(window.handleDeepLink) window.handleDeepLink('%s', '%s', '%s');",
                        address, network != null ? network : "sol", label != null ? label : ""
                    );
                    getBridge().getWebView().evaluateJavascript(js, null);
                }
            }
            // Handle https://walletwatcher.pro/...
            else if ("https".equals(data.getScheme()) && "walletwatcher.pro".equals(data.getHost())) {
                // Let the web view handle it naturally
            }
        }
    }
    
    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        
        // Handle biometric auth callback
        for (PluginHandle pluginHandle : getBridge().getPlugins()) {
            if (pluginHandle.getInstance() instanceof com.getcapacitor.BiometricAuthPlugin) {
                pluginHandle.getInstance().onRequestPermissionsResult(requestCode, permissions, grantResults);
            }
        }
    }
    
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        
        // Handle biometric auth callback
        for (PluginHandle pluginHandle : getBridge().getPlugins()) {
            pluginHandle.getInstance().onActivityResult(requestCode, resultCode, data);
        }
    }
}
