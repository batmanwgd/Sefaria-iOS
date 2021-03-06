'use strict';

import PropTypes from 'prop-types';

import React, { useState, useEffect, useContext, Fragment } from 'react';
import {
  Animated,
  Pressable,
  Platform,
  Share,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import HTMLView from 'react-native-htmlview'; //to convert html'afied JSON to something react can render (https://github.com/jsdf/react-native-htmlview)
import { SelectableText } from "@astrocoders/react-native-selectable-text";
import Clipboard from "@react-native-community/clipboard";

import { GlobalStateContext, getTheme } from './StateManager';
import styles from './Styles.js';

// pass correct functions to TextSegment for sheet renderers. probably combine renderers and make it simpler
const TextSegment = React.memo(({
  segmentRef,
  segmentKey,
  data,
  textType,
  bilingual,
  fontScale,
  setDictionaryLookup,
  showToast,
  openUriOrRef,
  onTextPress,
}) => {
  const [resetKey, setResetKey] = useState(0);
  const { themeStr, fontSize, biLayout } = useContext(GlobalStateContext);
  useEffect(() => {
    setResetKey(resetKey+1);  // hacky fix to reset htmlview when theme colors change
    return () => {};
  }, [themeStr, fontSize]);
  const theme = getTheme(themeStr);
  const getTextWithUrl = (text, withUrl) => {
    return withUrl ? `${text}\n\n${Sefaria.refToUrl(segmentRef)}` : text;
  };
  const shareText = (text) => {
    Share.share({
      message: getTextWithUrl(text, Platform.OS === 'android'),  // android for some reason doesn't share text with a url attached at the bottom
      title: segmentRef,
      url: Sefaria.refToUrl(segmentRef)
    })
  };
  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    showToast("Copied to clipboard");
  };

  const isStacked = biLayout === 'stacked';
  const lineHeightMultiplierHe = Platform.OS === 'android' ? 1.333 : 1.2;
  const justifyStyle = {textAlign: (isStacked && Platform.OS === 'ios') ? 'justify' : (textType === 'hebrew' ? 'right' : 'left')};
  const style = textType == "hebrew" ?
                [styles.hebrewText, theme.text, justifyStyle, {lineHeight: Animated.multiply(fontSize * lineHeightMultiplierHe, fontScale), fontSize: Animated.multiply(fontSize, fontScale)}] :
                [styles.englishText, theme.text, justifyStyle, {fontSize: Animated.multiply(0.8*fontSize, fontScale), lineHeight: Animated.multiply(fontSize * 1.04, fontScale) }];
  if (bilingual && textType == "english") {
    if (isStacked) {
      style.push(styles.bilingualEnglishText);
    }
    style.push(theme.bilingualEnglishText);
  }
  const smallSheet = {
    small: {
      fontSize: fontSize * 0.8 * (textType === "hebrew" ? 1 : 0.8)
    },
    hediv: {
      ...styles.hediv,
      ...justifyStyle,
    },
    endiv: {
      ...styles.endiv,
      ...justifyStyle,
    }
  };
  let menuItems = ['Copy', 'Define', 'Share'];
  if (textType === 'english') {
    menuItems.splice(1, 1);
  }

  const TempSelectableText = Platform.OS === 'ios' ? SelectableText : DummySelectableText;
  return (
    <TouchableOpacity
      onPress={() => onTextPress()}
      onLongPress={() => {}}
      delayPressIn={200}
    >
      <TempSelectableText
        menuItems={menuItems}
        onSelection={({ eventType, content }) => {
          if (eventType == 'Copy') { copyToClipboard(content); }
          else if (eventType == 'Share') { shareText(content); }
          else { onTextPress(true); setDictionaryLookup({ dictLookup: content }); }
        }}
        value={data}
        textValueProp={'value'}
        TextComponent={HTMLView}
        textComponentProps={{
          stylesheet: {...styles, ...smallSheet},
          RootComponent: Text,
          TextComponent: Animated.Text,
          onLinkPress: openUriOrRef,
          textComponentProps: {
            suppressHighlighting: false,
            key: segmentKey,
            style: style,
          },
        }}
      />
    </TouchableOpacity>
  );
});
TextSegment.whyDidYouRender = true;
TextSegment.propTypes = {
  segmentRef:         PropTypes.string.isRequired, /* this ref keys into TextColumn.rowRefs */
  segmentKey:         PropTypes.string,
  data:               PropTypes.string,
  textType:           PropTypes.oneOf(["english","hebrew"]),
  bilingual:          PropTypes.bool,
  onTextPress:        PropTypes.func.isRequired,
  showToast:          PropTypes.func.isRequired,
  fontScale:          PropTypes.object,
};

const DummySelectableText = ({ value, TextComponent, textComponentProps, ...props }) => {
  textComponentProps.value = value;
  return (
    <TextComponent
      { ...textComponentProps}
    />
);}
export default TextSegment;
