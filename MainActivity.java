package com.samfpro.beatwriter;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.annotation.Nullable;
import java.io.OutputStream;
import java.io.InputStream;
import java.io.BufferedReader;
import org.json.JSONObject;
import java.io.InputStreamReader;

public class MainActivity extends Activity {
    private static final int FILE_PICKER_REQUEST_CODE = 1;
    private WebView webView;
    private String fileData = ""; // Temporary storage for file data

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setSupportZoom(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setAllowFileAccessFromFileURLs(true);

        webView.setWebViewClient(new WebViewClient());
        webView.addJavascriptInterface(new WebAppInterface(), "Android");
        webView.loadUrl("file:///android_asset/index.html");
    }

    public class WebAppInterface {
        @JavascriptInterface
        public void saveFile(String data) {
            fileData = data; // Store data temporarily
            Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
            intent.setType("application/json");
            intent.putExtra(Intent.EXTRA_TITLE, "project.json");
            startActivityForResult(intent, FILE_PICKER_REQUEST_CODE);
        }

        @JavascriptInterface
        public void openFilePicker() {
            Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
            intent.setType("application/json");
            startActivityForResult(intent, FILE_PICKER_REQUEST_CODE);
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
         super.onActivityResult(requestCode, resultCode, data);
         if (requestCode == FILE_PICKER_REQUEST_CODE && resultCode == RESULT_OK) {
               if (data != null) {
                 Uri uri = data.getData();
                 if (uri != null) {
                     if (fileData.isEmpty()) { // Load mode
                               readFile(uri);
                     } else { // Save mode
                         writeFile(uri, fileData);
                     }
                 }
               }
         }
}

    private void writeFile(Uri uri, String data) {
        try (OutputStream outputStream = getContentResolver().openOutputStream(uri)) {
            if (outputStream != null) {
                outputStream.write(data.getBytes());
                outputStream.flush();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    private void readFile(Uri uri) {
      try (InputStream inputStream = getContentResolver().openInputStream(uri)) {
        if (inputStream != null) {
            BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
            StringBuilder stringBuilder = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                stringBuilder.append(line);
            }
            // Pass data back to JavaScript
            String fileData = stringBuilder.toString();
            runOnUiThread(() -> webView.evaluateJavascript(
                "window.fileManagerModule.handleLoadedFile(" + 
                JSONObject.quote(fileData) + 
                ");", 
                null
            ));
        }
    } catch (Exception e) {
        e.printStackTrace();
    }
   }

}