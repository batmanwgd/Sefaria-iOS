'use strict';

import React from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import iPad from './isIPad';
import themeWhite from './ThemeWhite';
import themeBlack from './ThemeBlack';
import strings from './LocalizedStrings';

const STATE_ACTIONS = {
  setTheme: "SET_THEME",
  setTextLanguage: "SET_TEXT_LANGUAGE",
  setInterfaceLanguage: "SET_INTERFACE_LANGUAGE",
  setEmailFrequency: "SET_EMAIL_FREQUENCY",
  setPreferredCustom: "SET_PREFERRED_CUSTOM",
  setFontSize: "SET_FONT_SIZE",
  setOverwriteVersions: "SET_OVERWRITE_VERSIONS",
  setAliyot: "SET_ALIYOT",
  toggleDebugInterruptingMessage: "TOGGLE_DEBUG_INTERRUPTING_MESSAGE",
  setBiLayout: "SET_BI_LAYOUT",
  setIsLoggedIn: "SET_IS_LOGGED_IN",
  setHasDismissedSyncModal: "SET_HAS_DISMISSED_SYNC_MODAL",
};

const UPDATE_SETTINGS_ACTIONS = {
  [STATE_ACTIONS.setInterfaceLanguage]: true,
  [STATE_ACTIONS.setEmailFrequency]: true,
  [STATE_ACTIONS.setPreferredCustom]: true,
};

const ACTION_CREATORS = {
  setTheme: (themeStr, fromAsync) => ({
    type: STATE_ACTIONS.setTheme,
    value: themeStr,
    fromAsync,
  }),
  setTextLanguage: (language, fromAsync) => ({
    type: STATE_ACTIONS.setTextLanguage,
    value: language,
    fromAsync,
  }),
  setInterfaceLanguage: (language, fromAsync) => ({
    type: STATE_ACTIONS.setInterfaceLanguage,
    value: language,
    fromAsync,
  }),
  setEmailFrequency: (freq, fromAsync) => ({
    type: STATE_ACTIONS.setEmailFrequency,
    value: freq,
    fromAsync,
  }),
  setPreferredCustom: (custom, fromAsync) => ({
    type: STATE_ACTIONS.setPreferredCustom,
    value: custom,
    fromAsync,
  }),
  setFontSize: (fontSize, fromAsync) => ({
    type: STATE_ACTIONS.setFontSize,
    value: fontSize,
    fromAsync,
  }),
  setOverwriteVersions: overwrite => ({
    type: STATE_ACTIONS.setOverwriteVersions,
    value: overwrite,
  }),
  setAliyot: show => ({
    type: STATE_ACTIONS.setAliyot,
    value: show,
  }),
  toggleDebugInterruptingMessage: (debug, fromAsync) => ({
    type: STATE_ACTIONS.toggleDebugInterruptingMessage,
    value: debug,
    fromAsync,
  }),
  setBiLayout: (layout, fromAsync) => ({
    type: STATE_ACTIONS.setBiLayout,
    value: layout,
    fromAsync,
  }),
  setIsLoggedIn: isLoggedIn => ({
    type: STATE_ACTIONS.setIsLoggedIn,
    value: isLoggedIn,
  }),
  setHasDismissedSyncModal: (hasDismissed, fromAsync) => ({
    type: STATE_ACTIONS.setHasDismissedSyncModal,
    value: hasDismissed,
  }),
}

const ASYNC_STORAGE_DEFAULTS = {
  textLanguage: {
    default: strings.getInterfaceLanguage().match(/^(?:he|iw)/) ? "hebrew" : "bilingual",
    action: ACTION_CREATORS.setTextLanguage,
  },
  interfaceLanguage: {
    default: strings.getInterfaceLanguage().match(/^(?:he|iw)/) ? "hebrew" : "english",
    action: ACTION_CREATORS.setInterfaceLanguage,
  },
  emailFrequency: {
    default: 'daily',
    action: ACTION_CREATORS.setEmailFrequency,
  },
  preferredCustom: {
    default: 'sephardi',
    action: ACTION_CREATORS.setPreferredCustom,
  },
  fontSize: {
    default: iPad ? 25 : 20,
    action: ACTION_CREATORS.setFontSize,
  },
  color: {
    default: "white",
    action: ACTION_CREATORS.setTheme,
  },
  showAliyot: {
    default: false,
    action: ACTION_CREATORS.setAliyot,
  },
  debugInterruptingMessage: {
    default: false,
    action: ACTION_CREATORS.toggleDebugInterruptingMessage,
  },
  biLayout: {
    default: 'stacked',
    action: ACTION_CREATORS.setBiLayout,
  },
  auth: {
    default: false,
    action: ACTION_CREATORS.setIsLoggedIn,
  },
  hasDismissedSyncModal: {
    default: false,
    action: ACTION_CREATORS.setHasDismissedSyncModal,
  },
};

const DEFAULT_STATE = {
  //theme: themeWhite,
  themeStr: ASYNC_STORAGE_DEFAULTS.color.default,
  textLanguage: ASYNC_STORAGE_DEFAULTS.textLanguage.default,
  interfaceLanguage: ASYNC_STORAGE_DEFAULTS.interfaceLanguage.default,
  emailFrequency: ASYNC_STORAGE_DEFAULTS.emailFrequency.default,
  preferredCustom: ASYNC_STORAGE_DEFAULTS.preferredCustom.default,
  fontSize: ASYNC_STORAGE_DEFAULTS.fontSize.default,
  overwriteVersions: true,
  showAliyot: ASYNC_STORAGE_DEFAULTS.showAliyot.default,
  debugInterruptingMessage: ASYNC_STORAGE_DEFAULTS.debugInterruptingMessage.default,
  biLayout: ASYNC_STORAGE_DEFAULTS.biLayout.default,
  isLoggedIn: ASYNC_STORAGE_DEFAULTS.auth.default,
  hasDismissedSyncModal: ASYNC_STORAGE_DEFAULTS.hasDismissedSyncModal.default,
};

const saveFieldToAsync = function (field, value) {
  AsyncStorage.setItem(field, JSON.stringify(value));
};

const reducer = function (state, action) {
  if (UPDATE_SETTINGS_ACTIONS[action.type] && !action.fromAsync) {
    AsyncStorage.setItem('lastSettingsUpdateTime', JSON.stringify(action.time));
  }
  switch (action.type) {
    case STATE_ACTIONS.setTheme:
      //const theme = action.value === "white" ? themeWhite : themeBlack;
      //no need to save value in async if that's where it is coming from
      if (!action.fromAsync) { saveFieldToAsync('color', action.value); }
      return {
        ...state,
        //theme,
        themeStr: action.value,
      };
    case STATE_ACTIONS.setTextLanguage:
      if (!action.fromAsync) { saveFieldToAsync('textLanguage', action.value); }
      return {
        ...state,
        textLanguage: action.value,
      };
    case STATE_ACTIONS.setInterfaceLanguage:
      if (!action.fromAsync) { saveFieldToAsync('interfaceLanguage', action.value); }
      if (action.value == 'hebrew') { strings.setLanguage('he'); }
      else if (action.value == 'english') { strings.setLanguage('en'); }
      return {
        ...state,
        interfaceLanguage: action.value,
      }
    case STATE_ACTIONS.setEmailFrequency:
      if (!action.fromAsync) { saveFieldToAsync('emailFrequency', action.value); }
      return {
        ...state,
        emailFrequency: action.value,
      }
    case STATE_ACTIONS.setPreferredCustom:
      if (!action.fromAsync) { saveFieldToAsync('preferredCustom', action.value); }
      return {
        ...state,
        preferredCustom: action.value,
      }
    case STATE_ACTIONS.setFontSize:
      if (!action.fromAsync) { saveFieldToAsync('fontSize', action.value); }
      return {
        ...state,
        fontSize: action.value,
      }
    case STATE_ACTIONS.setOverwriteVersions:
      return {
        ...state,
        overwriteVersions: action.value,
      }
    case STATE_ACTIONS.setAliyot:
      if (!action.fromAsync) { saveFieldToAsync('showAliyot', action.value); }
      return {
        ...state,
        showAliyot: action.value,
      }
    case STATE_ACTIONS.toggleDebugInterruptingMessage:
      // toggle if you didn't pass in debug, otherwise you're initializing the value
      const newDebug = action.value === undefined ? (!state.debugInterruptingMessage) : action.value;
      if (!action.fromAsync) { saveFieldToAsync('debugInterruptingMessage', newDebug); }
      return {
        ...state,
        debugInterruptingMessage: newDebug,
      }
    case STATE_ACTIONS.setBiLayout:
      if (!action.fromAsync) { saveFieldToAsync('biLayout', action.value); }
      return {
        ...state,
        biLayout: action.value,
      }
    case STATE_ACTIONS.setIsLoggedIn:
      // action can be passed either object or bool
      const isLoggedIn = !!action.value;
      if (isLoggedIn && !!action.value.uid) { Sefaria._auth = action.value; }
      console.log("redux isLoggedIn", isLoggedIn);
      return {
        ...state,
        isLoggedIn,
      }
    case STATE_ACTIONS.setHasDismissedSyncModal:
      if (!action.fromAsync) { saveFieldToAsync('hasDismissedSyncModal', action.value); }
      return {
        ...state,
        hasDismissedSyncModal: action.value,
      }
    default:
      return state;
  }
};

const initAsyncStorage = dispatch => {
  // Loads data from each field in `_data` stored in Async storage into local memory for sync access.
  // Returns a Promise that resolves when all fields are loaded.
  var promises = [];
  let asyncData = {};
  for (let field in ASYNC_STORAGE_DEFAULTS) {
    if (ASYNC_STORAGE_DEFAULTS.hasOwnProperty(field)) {
      const loader = function (field, value) {
        const actionValue = value ? JSON.parse(value) : ASYNC_STORAGE_DEFAULTS[field].default;
        dispatch(ASYNC_STORAGE_DEFAULTS[field].action(actionValue, true));
      }.bind(null, field);
      const promise = AsyncStorage.getItem(field)
        .then(loader)
        .catch(function(error) {
          console.error("AsyncStorage failed to load setting: " + error);
        });
      promises.push(promise);
    }
  }
  return Promise.all(promises);
};

const GlobalStateContext = React.createContext(null);
const DispatchContext = React.createContext(null);
const getTheme = themeStr => (themeStr === 'white' ? themeWhite : themeBlack);

export {
  DEFAULT_STATE,
  STATE_ACTIONS,
  reducer,
  initAsyncStorage,
  GlobalStateContext,
  DispatchContext,
  getTheme,
};
