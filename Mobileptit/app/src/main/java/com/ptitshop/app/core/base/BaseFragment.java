package com.ptitshop.app.core.base;

import android.content.Intent;
import androidx.fragment.app.Fragment;
import com.ptitshop.app.core.storage.SessionManager;
import com.ptitshop.app.ui.auth.LoginActivity;

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
