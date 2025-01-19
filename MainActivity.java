package com.samfpro.beatwriter;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ContentResolver;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.annotation.Nullable;
import org.json.JSONObject;

import java.io.*;

public class MainActivity extends Activity {
    private static final int FILE_PICKER_REQUEST_CODE = 1;
    private WebView webView;
    private String fileData = ""; // Temporary storage for file data
    private String fileType = "json"; // Default file type

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
            fileType = "json"; // File type for saving a project
            Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
            intent.setType("application/json");
            intent.putExtra(Intent.EXTRA_TITLE, "project.json");
            startActivityForResult(intent, FILE_PICKER_REQUEST_CODE);
        }

        @JavascriptInterface
        public void openFilePicker(String type) {
            fileType = type; // Set the file type (e.g., "json" or "audio")
            Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
            if ("audio".equals(type)) {
                intent.setType("audio/*");
            } else {
                intent.setType("application/json");
            }
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
                        if ("audio".equals(fileType)) {
                            handleAudioFile(uri);
                        } else {
                            readFile(uri);
                        }
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

    private void handleAudioFile(Uri uri) {
        try {
            String fileName = getFileNameFromUri(uri); // Optional utility to extract file name
            String fileUrl = copyFileToInternalStorage(uri, fileName);
            runOnUiThread(() -> webView.evaluateJavascript(
                "window.diskModule.beatTrackUrl = " + JSONObject.quote(fileUrl) + ";", 
                null
            ));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public String copyFileToInternalStorage(Uri uri, String outputFileName) throws IOException {
        ContentResolver contentResolver = getContentResolver();
        InputStream inputStream = contentResolver.openInputStream(uri);

        if (inputStream == null) {
            throw new IOException("Unable to open InputStream for URI: " + uri);
        }

        File outputFile = new File(getFilesDir(), "beatTrack/" + outputFileName); // Internal storage directory
        outputFile.getParentFile().mkdirs(); // Ensure the directory exists
        OutputStream outputStream = new FileOutputStream(outputFile);

        byte[] buffer = new byte[1024];
        int length;
        while ((length = inputStream.read(buffer)) > 0) {
            outputStream.write(buffer, 0, length);
        }

        inputStream.close();
        outputStream.close();

        // Return the file's URL
        return "file://" + outputFile.getAbsolutePath();
    }

    private String getFileNameFromUri(Uri uri) {
        // Optional utility to extract file name from Uri
        String result = uri.getLastPathSegment();
        if (result != null && result.contains("/")) {
            result = result.substring(result.lastIndexOf("/") + 1);
        }
        return result != null ? result : "audioFile.mp3";
    }
}