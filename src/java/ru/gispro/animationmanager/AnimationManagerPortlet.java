package ru.gispro.animationmanager;

import javax.portlet.RenderRequest;
import javax.portlet.RenderResponse;
import ru.gispro.GisproPortlet;

/**
 * AnimationManagerPortlet Portlet Class
 */
public class AnimationManagerPortlet extends GisproPortlet {

    @Override
    protected void doHeaders(RenderRequest request, RenderResponse response) {
        super.doHeaders(request, response);
        appendScript("/GISManagers/AnimationManagerPortlet/script/WMSStore.js", response);
        appendScript("/GISManagers/AnimationManagerPortlet/script/AnimationEditor.js", response);
        appendScript("/GISManagers/AnimationManagerPortlet/script/AnimationSource.js", response);
        appendScript("/GISManagers/AnimationManagerPortlet/script/AnimationGrid.js", response);
        appendScript("/GISManagers/AnimationManagerPortlet/script/app.js", response);

    }
}
