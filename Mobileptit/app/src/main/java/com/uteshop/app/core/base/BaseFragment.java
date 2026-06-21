package com.uteshop.app.core.base;

import android.content.Intent;
import androidx.fragment.app.Fragment;
import com.uteshop.app.core.storage.SessionManager;
import com.uteshop.app.ui.auth.LoginActivity;

public abstract class BaseFragment extends Fragment {
    protected SessionManager sessionManager;
    protected SessionManager session() {
        if(sessionManager==null)sessionManager=new SessionManager(requireContext());
        return sessionManager;
    }
    protected boolean requireLogin() {
        if(!session().isLoggedIn()) {
            startActivity(new Intent(requireContext(), LoginActivity.class));
            return false;
        }
        return true;
    }
}
