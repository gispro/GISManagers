package ru.gispro;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.Enumeration;
import java.util.Locale;
import java.util.Map;
import javax.portlet.ActionRequest;
import javax.portlet.ActionResponse;
import javax.portlet.GenericPortlet;
import javax.portlet.MimeResponse;
import javax.portlet.PortletException;
import javax.portlet.PortletPreferences;
import javax.portlet.RenderRequest;
import javax.portlet.RenderResponse;
import javax.portlet.ResourceRequest;
import javax.portlet.ResourceResponse;
import javax.servlet.http.Cookie;
import javax.swing.text.html.HTML.Attribute;
import javax.swing.text.html.HTML.Tag;
import org.w3c.dom.Element;

/**
 * AnimationManagerPortlet Portlet Class
 */
public class GisproPortlet extends GenericPortlet {

    @Override
    public void processAction(ActionRequest request, ActionResponse response) throws PortletException, IOException {
        if (request.getParameter("storePreference") != null) {
            String key = request.getParameter("key");
            String value = request.getParameter("value");
            PortletPreferences portletPreference = request.getPreferences();
            portletPreference.setValue(key, value);
            portletPreference.store();

        } else if (request.getParameter("resetPreference") != null) {
            String key = request.getParameter("key");
            PortletPreferences portletPreference = request.getPreferences();
            portletPreference.reset(key);
            portletPreference.store();
        }

    }

    @Override
    public void doView(RenderRequest request, RenderResponse response) throws PortletException, IOException {

        PrintWriter writer = response.getWriter();
        writer.write("<div id=\"mainContainer\" style=\"height:650px;\"></div>");
        writer.close();
    }

    @Override
    protected void doHeaders(RenderRequest request, RenderResponse response) {
        Element headElem = response.createElement("script");
        headElem.setAttribute("language", "javascript");
        headElem.setAttribute("type", "text/javascript");        
        headElem.setTextContent("var JOSSO_USER = '" + request.getRemoteUser() + "'; "
               + " var IS_ADMIN = "+(request.isUserInRole("RIHMI-WDC.RCITU:GIS:ADMIN"))+";"
                + " var PROXY_URL = '';"
                + " var PROXY_URL_REMOTE = '" + response.createResourceURL() + "';"
                + " var PREFERENCES_URL = '" + response.createActionURL() + "';"
                + " var OVROOT = '" + request.getContextPath() + "/';");
        response.addProperty(MimeResponse.MARKUP_HEAD_ELEMENT, headElem);

        appendCss("/GISManagers/lib/ExtJS/ext-all.css", response);
//        appendCss("http://docs.sencha.com/extjs/4.0.7/extjs-build/resources/css/ext-all.css", response);        
        appendCss("/GISManagers/css/all.css", response);

        appendScript("/GISManagers/lib/OpenLayers/OpenLayers.js", response);
        appendScript("/GISManagers/lib/GeoExt/GeoExt.js", response);
        appendScript("/GISManagers/lib/ExtJS/ext-all.js", response);
//        appendScript("http://docs.sencha.com/extjs/4.0.7/extjs-build/ext-all.js", response);
        appendScript("/GISManagers/lib/ExtJS/ext-locale-ru.js", response);
        appendScript("/GISManagers/config.js", response);
    }

    protected void appendScript(String url, RenderResponse response) {
        Element scriptElement = response.createElement(Tag.SCRIPT.toString());
        scriptElement.setAttribute(Attribute.TYPE.toString(), "text/javascript");
        scriptElement.setAttribute(Attribute.SRC.toString(), url);
        scriptElement.setTextContent(" ");
        response.addProperty(MimeResponse.MARKUP_HEAD_ELEMENT, scriptElement);
    }

    protected void appendCss(String url, RenderResponse response) {
        Element css = response.createElement(Tag.LINK.toString());
        css.setAttribute(Attribute.TYPE.toString(), "text/css");
        css.setAttribute(Attribute.HREF.toString(), url);
        css.setAttribute(Attribute.REL.toString(), "stylesheet");
        css.setTextContent(" ");
        response.addProperty(MimeResponse.MARKUP_HEAD_ELEMENT, css);
    }

    @Override
    public void serveResource(ResourceRequest request, ResourceResponse response) throws PortletException, IOException {
        if (request.getParameter("getPreference") != null) {
            String key = request.getParameter("key");
            PortletPreferences portletPreference = request.getPreferences();
            String res = portletPreference.getValue(key, "undefined");
            response.setContentType("application/json; charset=UTF-8");
            response.getWriter().write("{\"" + key + "\":\"" + res + "\"}");
        } else if (request.getParameter("downloadUrl") != null) {
        } else if (request.getParameter("urltoproxify") != null) {
            BufferedReader rd = null;
            PrintWriter out = null;
            try {
                Map<String, String[]> params = request.getParameterMap();

                Enumeration parnames = request.getParameterNames();
                StringBuilder parstr = new StringBuilder();
                while (parnames.hasMoreElements()) {
                    String name = (String) parnames.nextElement();
                    if (!name.equals("urltoproxify")) {
                        parstr.append("&" + name + "=" + URLEncoder.encode(params.get(name)[0].toString(), "UTF-8"));
                    }
                }
                String goturl = request.getParameter("urltoproxify");
                goturl = (goturl.indexOf("?") < 0 && parstr.length() > 0) ? goturl + "?" : goturl;
                String strurl = ((goturl != null) ? goturl + parstr : "").replace("?&", "?");
                URL url = new URL(strurl);
                HttpURLConnection con = (HttpURLConnection) url.openConnection();
                con.setDoOutput(true);
                con.setRequestMethod(request.getMethod());
                String reqContenType = request.getContentType();

                if (reqContenType != null) {
                    if (reqContenType.indexOf("charset") < 0) {
                        reqContenType += "; charset=UTF-8";
                    }
                    con.setRequestProperty("Content-Type", reqContenType);
                } else {
                    con.setRequestProperty("Content-Type", "text/plain; charset=UTF-8");
                }

                Cookie[] cookies = request.getCookies();
                StringBuilder cookiestr = new StringBuilder();
                for (Cookie c : cookies) {
                    cookiestr.append(c.getName() + "=" + c.getValue() + ";");
                }
                con.setRequestProperty("Cookie", cookiestr.toString());


                int clength = request.getContentLength();
                if (clength > 0) {
                    con.setDoInput(true);
                    byte[] bdata = new byte[clength];
                    char[] cdata = new char[clength];
                    request.getReader().read(cdata, 0, clength);
                    bdata = new String(cdata).getBytes("UTF-8");
                    OutputStream os = con.getOutputStream();
                    os.write(bdata, 0, clength);
                }

                // respond to client
                String ctype = con.getContentType();
                if (ctype == null) ctype = "text/xml; charset=UTF-8";
                if (ctype.indexOf("charset") < 0) {
                    ctype += "; charset=UTF-8";
                }
                response.setContentType(ctype);
                response.setProperty(ResourceResponse.HTTP_STATUS_CODE, String.valueOf(con.getResponseCode()));

                rd = new BufferedReader(new InputStreamReader(con.getInputStream(), "UTF-8"));
                out = response.getWriter();
                String line;
                int i = 0;
                while (((line = rd.readLine()) != null) && (!line.trim().equals(""))) {
                    out.println(line);
                }
                rd.close();
            } catch (Exception e) {
                out = response.getWriter();
                StringWriter sw = new StringWriter();
                e.printStackTrace(new PrintWriter(sw));
                String stacktrace = sw.toString();
                out.println(stacktrace);
            } finally {
                if (rd != null) {
                    rd.close();
                }
                if (out != null) {
                    out.close();
                }
            }
        }
    }
}
