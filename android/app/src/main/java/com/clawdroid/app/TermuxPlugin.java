package com.clawdroid.app;

import android.content.ComponentName;
import android.content.Intent;
import android.util.Log;

import com.getcapacitor.JSArray;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;

import java.util.ArrayList;
import java.util.List;

@CapacitorPlugin(name = "Termux")
public class TermuxPlugin extends Plugin {

    @PluginMethod
    public void runCommand(PluginCall call) {
        String executable = call.getString("executable", "/data/data/com.termux/files/usr/bin/bash");
        JSArray argsArray = call.getArray("args");
        boolean background = call.getBoolean("background", true);

        List<String> argsList = new ArrayList<>();
        if (argsArray != null) {
            try {
                for (int i = 0; i < argsArray.length(); i++) {
                    argsList.add(argsArray.getString(i));
                }
            } catch (JSONException e) {
                call.reject("Invalid args", e);
                return;
            }
        }

        Intent intent = new Intent();
        intent.setComponent(new ComponentName("com.termux", "com.termux.app.RunCommandService"));
        intent.setAction("com.termux.RUN_COMMAND");
        intent.putExtra("com.termux.RUN_COMMAND_PATH", executable);
        intent.putExtra("com.termux.RUN_COMMAND_ARGUMENTS", argsList.toArray(new String[0]));
        intent.putExtra("com.termux.RUN_COMMAND_BACKGROUND", background);

        try {
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                getContext().startForegroundService(intent);
            } else {
                getContext().startService(intent);
            }
            call.resolve();
        } catch (Exception e) {
            Log.e("TermuxPlugin", "Failed to run termux command", e);
            call.reject("Failed to run termux command: " + e.getMessage(), e);
        }
    }
}
