package ru.gispro.profilemanager;

import javax.portlet.RenderRequest;
import javax.portlet.RenderResponse;
import ru.gispro.GisproPortlet;

/**
 * RubricatorEditorPortlet Portlet Class
 */
public class ProfileManagerPortlet extends GisproPortlet {

    @Override
    protected void doHeaders(RenderRequest request, RenderResponse response) {
        super.doHeaders(request, response);
        appendScript("/GISManagers/ProfileManagerPortlet/script/app.js", response);
        appendScript("/GISManagers/ProfileManagerPortlet/script/AddLayers.js", response);
        appendScript("/GISManagers/ProfileManagerPortlet/script/ExtentPicker.js", response);
        appendScript("/GISManagers/ProfileManagerPortlet/script/Stores.js", response);
        appendScript("/GISManagers/ProfileManagerPortlet/script/ProfileGrid.js", response);
    }
}
