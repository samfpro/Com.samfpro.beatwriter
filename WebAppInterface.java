package com.samfpro.beatwriter;

import android.database.Cursor;          // For Cursor
import android.provider.OpenableColumns; // For OpenableColumns
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.os.AsyncTask;
import androidx.core.content.FileProvider;
import java.io.*;
import android.util.Base64;

public class WebAppInterface {
    private Context context;
    private WebView webView;

    private static final int SAVE_AS_REQUEST_CODE = 1234;
    private static final int LOAD_REQUEST_CODE = 1235;
    private static final int AUDIO_LOAD_REQUEST_CODE = 1236;
    private static final int SAVE_AUDIO_REQUEST_CODE = 1237;


    public WebAppInterface(Context context, WebView webView) {
        this.context = context;
        this.webView = webView;
    }

    private String pendingAudioData;


    @JavascriptInterface
    public void saveFileAs(String content) {
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/json");
        intent.putExtra(Intent.EXTRA_TITLE, "Untitled.json");

        if (context instanceof Activity) {
            ((Activity) context).startActivityForResult(intent, SAVE_AS_REQUEST_CODE);
        }
    }

    @JavascriptInterface
    public void saveFile(String fileUri, String content) {
        if (fileUri != null && !fileUri.isEmpty()) {
            Uri uri = Uri.parse(fileUri);
            writeFileToUri(uri, content);
            sendSaveResultToWebView(uri);
        }
    }

    @JavascriptInterface
    public void loadFile() {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/json");

        if (context instanceof Activity) {
            ((Activity) context).startActivityForResult(intent, LOAD_REQUEST_CODE);
        }
    }

    @JavascriptInterface
    public void loadAudioFile() {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("audio/*");

        if (context instanceof Activity) {
            ((Activity) context).startActivityForResult(intent, AUDIO_LOAD_REQUEST_CODE);
        }
    }

    private void writeFileToUri(Uri uri, String content) {
        try (ParcelFileDescriptor pfd = context.getContentResolver().openFileDescriptor(uri, "w");
             FileOutputStream fos = new FileOutputStream(pfd.getFileDescriptor())) {
            fos.write(content.getBytes());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void sendSaveAsResultToWebView(Uri uri) {
        String fileName = getFileName(uri);
        String fileUri = uri.toString();

        webView.post(() -> webView.evaluateJavascript(
                String.format("window.projectManager.handleAndroidSaveAsResult('%s', '%s')",
                        fileName.replace("'", "\\'"), fileUri.replace("'", "\\'")),
                null
        ));
    }

    private void sendSaveResultToWebView(Uri uri) {
        String fileName = getFileName(uri);
        String fileUri = uri.toString();

        webView.post(() -> webView.evaluateJavascript(
                String.format("window.projectManager.handleAndroidSaveResult('%s', '%s')",
                        fileName.replace("'", "\\'"), fileUri.replace("'", "\\'")),
                null
        ));
    }

    private void sendLoadResultToWebView(Uri uri) {
        try (InputStream inputStream = context.getContentResolver().openInputStream(uri);
             BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {

            StringBuilder content = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                content.append(line);
            }

            String fileContent = content.toString();

            webView.post(() -> webView.evaluateJavascript(
                    String.format("window.projectManager.handleAndroidLoadResult(`%s`)", fileContent.replace("`", "\\`")),
                    null
            ));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    
    private void sendAudioErrorToWebView(String errorMessage) {
    // Assign to an effectively final variable
    String finalErrorMessage = (errorMessage != null) ? errorMessage : "Unknown error occurred";
    
    webView.post(() -> webView.evaluateJavascript(
        String.format("window.beatTrack.handleAndroidAudioError('%s')", 
            finalErrorMessage.replace("'", "\\'")),
        null
    ));
    }

    private void copyAudioToLocal(Uri uri) {
    new AsyncTask<Uri, Void, Void>() {
        @Override
        protected Void doInBackground(Uri... uris) {
            Uri selectedUri = uris[0];
            try (InputStream inputStream = context.getContentResolver().openInputStream(selectedUri)) {
                if (inputStream == null) {
                    sendAudioErrorToWebView("Failed to open input stream");
                    return null;
                }

                String fileName = getFileName(selectedUri);
                File outFile = new File(context.getFilesDir(), fileName);

                try (FileOutputStream outputStream = new FileOutputStream(outFile)) {
                    byte[] buffer = new byte[1024];
                    int length;
                    while ((length = inputStream.read(buffer)) > 0) {
                        outputStream.write(buffer, 0, length);
                    }
                }

                // Use FileProvider to get a content URI
                Uri contentUri = FileProvider.getUriForFile(
                    context, 
                    "com.samfpro.beatwriter.fileprovider", 
                    outFile
                );
                sendAudioLoadResultToWebView(contentUri);
            } catch (IOException e) {
                e.printStackTrace();
                sendAudioErrorToWebView(e.getMessage());
            }
            return null;
        }
    }.execute(uri);
}

    private void sendAudioLoadResultToWebView(Uri uri) {
        String fileName = getFileName(uri);
        String fileUri = uri.toString();

        webView.post(() -> webView.evaluateJavascript(
                String.format("window.beatTrack.handleAndroidAudioLoadResult('%s', '%s')",
                        fileName.replace("'", "\\'"), fileUri.replace("'", "\\'")),
                null
        ));
    }

   private String getFileName(Uri uri) {
    String name = null;
    try (Cursor cursor = context.getContentResolver().query(uri, null, null, null, null)) {
        if (cursor != null && cursor.moveToFirst()) {
            name = cursor.getString(cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME));
        }
    } catch (Exception e) {
        e.printStackTrace();
    }
    return name != null ? name : "unnamed";
}

    public void handleActivityResult(int requestCode, int resultCode, Intent data) {
        if (resultCode == Activity.RESULT_OK && data != null) {
            Uri uri = data.getData();
            if (uri == null) return;

            if (requestCode == SAVE_AS_REQUEST_CODE) {
                sendSaveAsResultToWebView(uri);
            } else if (requestCode == LOAD_REQUEST_CODE) {
                sendLoadResultToWebView(uri);
            } else if (requestCode == AUDIO_LOAD_REQUEST_CODE) {
                copyAudioToLocal(uri);
            }else   if (requestCode == SAVE_AUDIO_REQUEST_CODE) {
                writeAudioDataToUri(uri); // Write stored data to selected URI
        }
        
    }
        }
    @JavascriptInterface
    public void saveAudioFileAs(String base64Data) {
              pendingAudioData = base64Data; // Store the audio data
    
    Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
    intent.addCategory(Intent.CATEGORY_OPENABLE);
    intent.setType("audio/wav");
    intent.putExtra(Intent.EXTRA_TITLE, "recording.wav");
    
    if (context instanceof Activity) {
        ((Activity) context).startActivityForResult(intent, SAVE_AUDIO_REQUEST_CODE);
    }
}

// Add this helper method
private void writeAudioDataToUri(Uri uri) {
    if (pendingAudioData == null) return;
    
    byte[] audioBytes = Base64.decode(pendingAudioData, Base64.DEFAULT);
    try (ParcelFileDescriptor pfd = context.getContentResolver().openFileDescriptor(uri, "w");
         FileOutputStream fos = new FileOutputStream(pfd.getFileDescriptor())) {
        fos.write(audioBytes);
    } catch (IOException e) {
        e.printStackTrace();
    } finally {
        pendingAudioData = null; // Clear data after writing
    }
}
}