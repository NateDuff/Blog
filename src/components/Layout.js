import React from 'react'
import { Helmet } from 'react-helmet'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import './all.sass'
import useSiteMetadata from './SiteMetadata'
import { withPrefix } from 'gatsby'

import AdalConfig from '../config/AdalConfig'
import AuthContext from '../services/Auth'

import { BrowserView } from 'react-device-detect'

// import * as toastr from 'toastr'

import { appInsights } from '../telemetry'

export const onServiceWorkerUpdateReady = () => {
  const answer = window.confirm(
    `This application has been updated. ` +
      `Reload to display the latest version?`
  )
  if (answer === true) {
    window.location.reload()
  }
}

const TemplateWrapper = ({ children }) => {
  const { title, description } = useSiteMetadata()
  let isAuthenticated = false;
  let isAdmin = false;

  let pushToken = "";
  if (typeof window !== 'undefined') {
    pushToken = window.localStorage.token;
  }

  AuthContext.handleWindowCallback()

  if (typeof window !== 'undefined' && (window === window.parent) && window === window.top && !AuthContext.isCallback(window.location.hash)) {
    if (!AuthContext.getCachedToken(AdalConfig.clientId) || !AuthContext.getCachedUser()) {
      console.log('Not logged in');

      appInsights.trackPageView({name: window.title, uri: window.location.href, isLoggedIn: false, properties: {Token: pushToken}})
    } else {
      AuthContext.acquireToken(AdalConfig.endpoints.api, (message, token, msg) => {
        if (token) {
          appInsights.setAuthenticatedUserContext(_adalInstance._user.profile.oid, _adalInstance._user.profile.upn, true);

          isAuthenticated = true;

          isAdmin = _adalInstance._user.profile.upn?.endsWith("@nateduff.com") ? true : false;

          appInsights.trackPageView({name: window.title, uri: window.location.href, isLoggedIn: true, properties: {User: _adalInstance._user.profile.upn, Token: pushToken}})
        }
      })
    }
  }

  return (
      <div className="content">      
        <Helmet>
          <html lang="en" />
          <title>{title}</title>
          <meta name="description" content={description} />

          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href={`${withPrefix('/')}img/apple-touch-icon.png`}
          />
          <link
            rel="icon"
            type="image/png"
            href={`${withPrefix('/')}img/favicon-32x32.png`}
            sizes="32x32"
          />
          <link
            rel="icon"
            type="image/png"
            href={`${withPrefix('/')}img/favicon-16x16.png`}
            sizes="16x16"
          />

          <link
            rel="mask-icon"
            href={`${withPrefix('/')}img/safari-pinned-tab.svg`}
            color="#ff4400"
          />
          <meta name="theme-color" content="#fff" />

          <meta property="og:type" content="business.business" />
          <meta property="og:title" content={title} />
          <meta property="og:url" content="/" />
          <meta
            property="og:image"
            content={`${withPrefix('/')}img/og-image.jpg`}
          />
        </Helmet>
        
          <Navbar isAuthenticated={isAuthenticated} isAdmin={isAdmin}/>

          <div>{children}</div>

          <Helmet 
            script={[{ 
              type: 'text/javascript', 
              innerHTML: "var classNameDark = 'dark-mode';\
              var classNameLight = 'light-mode';\
              function setClassOnDocumentBody(darkMode) {\
                if (document.body) {\
                document.body.classList.add(\
                  darkMode ? classNameDark : classNameLight\
                );\
                document.body.classList.remove(\
                  darkMode ? classNameLight : classNameDark\
                );\
              }\
              var preferDarkQuery = '(prefers-color-scheme: dark)';\
              var mql = window.matchMedia(preferDarkQuery);\
              var supportsColorSchemeQuery = mql.media === preferDarkQuery;\
              var localStorageTheme = null;\
              try {\
                localStorageTheme = localStorage.getItem('darkMode');\
              } catch (err) {}\
              var localStorageExists = localStorageTheme !== null;\
              if (localStorageExists) {\
                localStorageTheme = JSON.parse(localStorageTheme);\
              }\
              if (localStorageExists) {\
                setClassOnDocumentBody(localStorageTheme);\
              } else if (supportsColorSchemeQuery) {\
                setClassOnDocumentBody(mql.matches);\
                localStorage.setItem('darkMode', mql.matches);\
              } else {\
                var isDarkMode = document.body.classList.contains(classNameDark);\
                localStorage.setItem('darkMode', JSON.stringify(isDarkMode));\
              }}"}]} />              

          <Helmet>
            <script src={`${withPrefix('/')}firebase-app.js`} type="text/javascript" />
            <script src={`${withPrefix('/')}firebase-messaging.js`} type="text/javascript" />
            <script src={`${withPrefix('/')}jquery-3.1.1.min.js`} type="text/javascript" />
          </Helmet>

          <Helmet
            script={[{
              type: 'text/javascript', 
              innerHTML: "var firebaseConfig = {\
                apiKey: '" + process.env.firebase_apiKey + "',\
                authDomain: '" + process.env.firebase_authDomain + "',\
                databaseURL: '" + process.env.firebase_databaseURL + "',\
                projectId: '" + process.env.firebase_projectId + "',\
                storageBucket: '" + process.env.firebase_storageBucket + "',\
                messagingSenderId: '" + process.env.firebase_messagingSenderId + "',\
                appId: '" + process.env.firebase_appId + "',\
              };\
              function subscribeToTopic(token, topic) {\
                let cachedToken = window.localStorage.getItem('token');\
                if (!cachedToken) {\
                  window.localStorage.setItem('token', token);\
                }\
                $.ajax({\
                  type: 'POST',\
                  url: 'https://iid.googleapis.com/iid/v1/' + token + '/rel/topics/BlogSubscribers',\
                  contentType: 'application/json',\
                  dataType: 'json',\
                  headers: {\
                    Authorization: 'key=" + process.env.firebase_serverKey + "',\
                  },\
                  success: function (response) {\
                    console.log(response);\
                  },\
                  error: function (xhr, status, error) {\
                    console.log(xhr);\
                  },\
                });\
                $.ajax({\
                  type: 'POST',\
                  url: location.origin + '/api/New-Subscriber?code=3fCQRCYZMMQArvJUaK9512f/RM47VM7LTiaWPDlg5H2RxSBj5cTaUA==',\
                  contentType: 'application/json',\
                  dataType: 'json',\
                  data: JSON.stringify({\"regToken\": token, \"email\": _adalInstance._user?.profile.upn}),\
                  success: function (response) {\
                    console.log(response);\
                  },\
                  error: function (xhr, status, error) {\
                    console.log(xhr);\
                  },\
                });\
              }\
              if ('serviceWorker' in navigator && firebase) {\
                navigator.serviceWorker.register('/sw.js').then(\
                  function (registration) {\
                    console.log('Registration successful, scope is:', registration.scope);\
                    console.log('Setting up Firebase');\
                    firebase.initializeApp(firebaseConfig);\
                    const messaging = firebase.messaging();\
                    messaging.useServiceWorker(registration);\
                    messaging.usePublicVapidKey(\
                      '" + process.env.firebase_publicKey + "'\
                    );\
                    messaging.onTokenRefresh(() => {\
                      messaging\
                        .getToken()\
                        .then((refreshedToken) => {\
                          console.log('Token refreshed.');\
                          localStorage.setItem('token', token);\
                          subscribeToTopic(token, 'BlogSubscribers');\
                        })\
                        .catch((err) => {\
                          console.log('Unable to retrieve refreshed token ', err);\
                        });\
                    });\
                    messaging.onMessage((payload) => {\
                      console.log('Message received. ', payload);\
                    });\
                    messaging\
                        .getToken()\
                        .then((token) => {\
                          console.log('Token retrieved.');\
                        });\
                  },\
                  function (err) {\
                    console.log('ServiceWorker registration failed: ', err);\
                  }\
                )}" 
            }]}/>

          <Footer isAuthenticated={isAuthenticated} isAdmin={isAdmin} />   
      </div>
  )
}

export default TemplateWrapper
