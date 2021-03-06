import RNFB from 'rn-fetch-blob';
import AsyncStorage from '@react-native-community/async-storage';
import Sefaria from '../sefaria';

describe('history', () => {
  test('migrateFromOldRecents', async () => {
    const recentItems = JSON.stringify([
      {  // normal case with versions
        ref: "Genesis 1:1",
        heRef: "בראשית א",
        versions: { en: "enVersion", he: "heVersion" },
        category: "Tanakh"
      },
      {  // corrupted versions
        ref: "Genesis 1:2",
        heRef: "בראשית א",
        versions: false,
        category: "Tanakh"
      },
      {  // section ref
        ref: "Genesis 1",
        heRef: "בראשית א",
        versions: {},
        category: "Tanakh"
      }
    ]);
    const sefariaEpoch = Math.floor((new Date(2017, 11, 1)).getTime()/1000);
    const historyItems = JSON.stringify([
      {
        ref: "Genesis 1:1",
        he_ref: "בראשית א:א׳",
        versions: { en: "enVersion", he: "heVersion" },
        book: "Genesis",
        time_stamp: sefariaEpoch,
      },
      {
        ref: "Genesis 1:2",
        he_ref: "בראשית א:ב׳",
        versions: {},
        book: "Genesis",
        time_stamp: sefariaEpoch,
      },
      {
        ref: "Genesis 1",
        he_ref: "בראשית א",
        versions: {},
        book: "Genesis",
        time_stamp: sefariaEpoch,
      }
    ]);
    const lastSyncTime = '' + sefariaEpoch;
    const lastPlace = JSON.stringify(Sefaria.history.historyToLastPlace(JSON.parse(historyItems)));
    Sefaria.textTitleForRef = jest.fn(() => "Genesis");
    AsyncStorage.setItem('recent', recentItems);
    await Sefaria.history.migrateFromOldRecents();

    // matchers
    expect((await AsyncStorage.getItem('recent'))).toBeNull();
    expect((await AsyncStorage.getItem('history'))).toBeNull();
    expect((await AsyncStorage.getItem('lastSyncItems'))).toBe(historyItems);
    expect((await AsyncStorage.getItem('lastSyncTime'))).toBe(lastSyncTime);
    expect((await AsyncStorage.getItem('lastPlace'))).toBe(lastPlace);

  });

  test('historyToLastPlace', () => {
    const history = [
      {
        book: "Genesis",
        ref: "Genesis 1:1"
      },
      {
        book: "Exodus",
        ref: "Exodus 1:1"
      },
      {
        book: "Genesis",
        ref: "Genesis 1:2"
      },
      {
        book: "Leviticus",
        ref: "Leviticus 1:1"
      },
      {
        book: "Leviticus",
        ref: "Leviticus 1:2"
      },
    ];
    const lastPlace = [
      {
        book: "Genesis",
        ref: "Genesis 1:1"
      },
      {
        book: "Exodus",
        ref: "Exodus 1:1"
      },
      {
        book: "Leviticus",
        ref: "Leviticus 1:1"
      },
    ];
    expect(Sefaria.history.historyToLastPlace(history)).toEqual(lastPlace);
  });

  test('getHistoryObject', () => {
    const state = {

    };
  });

  test('saveHistoryItemUnchanged', async () => {
    const historyItem = {
      ref: "Genesis 1:5",
      he_ref: "בראשית א:א",
      versions: {},
      book: "Genesis",
      language: "english",
    };
    const getHistoryObject = jest.fn()
      .mockReturnValueOnce(historyItem)
      .mockReturnValueOnce(historyItem);
    Sefaria.history.lastPlace = [];
    Sefaria.history.lastSync = [];
    await AsyncStorage.setItem('lastSyncItems', '');
    await Sefaria.history.saveHistoryItem(getHistoryObject, true, null, 1);
    expect((await AsyncStorage.getItem('lastSyncItems'))).toBe(JSON.stringify([historyItem]));
    expect((await AsyncStorage.getItem('lastPlace'))).toBe(JSON.stringify([historyItem]));
  });

  test('saveHistoryItemDuplicate', async () => {
    const historyItem = {
      ref: "Genesis 1:5",
      he_ref: "בראשית א:א",
      versions: {},
      book: "Genesis",
      language: "english",
    };
    let getHistoryObject = jest.fn()
      .mockReturnValueOnce(historyItem)
      .mockReturnValueOnce(historyItem);
    Sefaria.history.lastPlace = [];
    Sefaria.history.lastSync = [{...historyItem, time_stamp: Sefaria.util.epoch_time()}];
    await AsyncStorage.setItem('lastSyncItems', '');
    await Sefaria.history.saveHistoryItem(getHistoryObject, true, null, 1);
    expect((await AsyncStorage.getItem('lastSyncItems'))).toBeNull();

    // test that if the item is old enough it will save
    getHistoryObject = jest.fn()
      .mockReturnValueOnce(historyItem)
      .mockReturnValueOnce(historyItem);
    Sefaria.history.lastPlace = [];
    const oldHistoryItem = {...historyItem, time_stamp: Sefaria.util.epoch_time() - 61};
    Sefaria.history.lastSync = [oldHistoryItem];
    await AsyncStorage.setItem('lastSyncItems', '');
    await Sefaria.history.saveHistoryItem(getHistoryObject, true, null, 1);
    expect((await AsyncStorage.getItem('lastSyncItems'))).toBe(JSON.stringify([historyItem, oldHistoryItem]));
  });

  test('saveHistoryItemChanged', async () => {
    const historyItem = {
      ref: "Genesis 1:5",
      he_ref: "בראשית א:א",
      versions: {},
      book: "Genesis",
      language: "english",
    };
    const historyItem2 = {...historyItem, ref: "Genesis 1:6", he_ref: "Genesis 1:7"};
    const getHistoryObject = jest.fn()
      .mockReturnValueOnce(historyItem)
      .mockReturnValueOnce(historyItem2);
    Sefaria.history.lastPlace = [];
    Sefaria.history.lastSync = [];
    await AsyncStorage.setItem('lastSyncItems', '');
    await Sefaria.history.saveHistoryItem(getHistoryObject, true, null, 1);
    expect((await AsyncStorage.getItem('lastSyncItems'))).toBeNull();
  });

  test('saveHistoryItemVersionChanged', async () => {
    const historyItem = {
      ref: "Genesis 1:5",
      he_ref: "בראשית א:א",
      versions: {},
      book: "Genesis",
      language: "english",
    };
    const historyItem2 = {...historyItem, versions: {en: "Version Yo"}};
    const getHistoryObject = jest.fn()
      .mockReturnValueOnce(historyItem)
      .mockReturnValueOnce(historyItem2);
    Sefaria.history.lastPlace = [];
    Sefaria.history.lastSync = [];
    await AsyncStorage.setItem('lastSyncItems', '');
    await Sefaria.history.saveHistoryItem(getHistoryObject, true, null, 1);
    expect((await AsyncStorage.getItem('lastSyncItems'))).toBeNull();
  });

  test('saveHistorySecondary', async () => {
    const historyItem = {
      ref: "Genesis 1:5",
      he_ref: "בראשית א:א",
      versions: {},
      book: "Genesis",
      language: "english",
      secondary: true,
    };
    const getHistoryObject = jest.fn()
      .mockReturnValueOnce(historyItem)
      .mockReturnValueOnce(historyItem);
    Sefaria.history.lastPlace = [];
    Sefaria.history.lastSync = [];
    await AsyncStorage.setItem('lastSyncItems', '');
    await AsyncStorage.setItem('lastPlace', '');
    await Sefaria.history.saveHistoryItem(getHistoryObject, true, null, 1);
    expect((await AsyncStorage.getItem('lastSyncItems'))).toBe(JSON.stringify([historyItem]));
    expect((await AsyncStorage.getItem('lastPlace'))).toBeNull();
  });

  test('getHistoryRefForTitle', async () => {
    Sefaria.history.lastPlace = [
      {
        ref: "Genesis 1:5",
        he_ref: "בראשית א:ה",
        versions: {},
        book: "Genesis",
        language: "english",
      },
      {
        ref: "Exodus 1:5",
        he_ref: "שמות א:ה",
        versions: {},
        book: "Exodus",
        language: "english",
      },
      {
        ref: "Genesis 1:6",
        he_ref: "בראשית א:ו",
        versions: {},
        book: "Genesis",
        language: "english",
      },
    ];
    Sefaria.textTitleForRef = jest.fn()
      .mockReturnValueOnce("Genesis")
      .mockReturnValueOnce("Genesis")
      .mockReturnValueOnce("Exodus");
    expect(Sefaria.history.getHistoryRefForTitle("Genesis")).toEqual(Sefaria.history.lastPlace[0]);
    expect(Sefaria.history.getHistoryRefForTitle("Exodus")).toEqual(Sefaria.history.lastPlace[1]);
  });

  test('_loadHistoryItems', async () => {
    // empty
    await AsyncStorage.removeItem('recent');
    await AsyncStorage.removeItem('lastPlace');
    await AsyncStorage.removeItem('lastSyncItems');
    await Sefaria.history._loadHistoryItems();
    expect(Sefaria.history.lastPlace).toEqual([]);
    expect(Sefaria.history.lastSync).toEqual([]);

    // with an item
    const historyItem = {
      ref: "Genesis 1:5",
      he_ref: "בראשית א:א",
      versions: {},
      book: "Genesis",
      language: "english",
      secondary: true,
    };
    await AsyncStorage.setItem('lastPlace', JSON.stringify([historyItem]));
    await Sefaria.history._loadHistoryItems();
    expect(Sefaria.history.lastPlace).toEqual([historyItem]);

    // with an error
    await AsyncStorage.setItem('lastPlace', "ERROR");
    await Sefaria.history._loadHistoryItems();
    expect(Sefaria.history.lastPlace).toEqual([]);
  });

  test('sync mobile history', async () => {
    const lastSyncItems = [
      {
        ref: "Genesis 1:6",
        he_ref: "בראשית א:ו",
        versions: {},
        book: "Genesis",
        language: "english",
        time_stamp: 1,
      },
      {
        ref: "Genesis 1:5",
        he_ref: "בראשית א:ה",
        versions: {},
        book: "Genesis",
        language: "english",
        time_stamp: 0,
      }
    ];
    await AsyncStorage.removeItem('history');
    await AsyncStorage.setItem('lastSyncItems', JSON.stringify(lastSyncItems));
    await AsyncStorage.removeItem('lastSyncTime');
    const auth = { uid: 1, token: 2 };
    Sefaria.api.getAuthToken = jest.fn(() => {
      Sefaria._auth = auth;
    });
    fetch = jest.fn(() => Promise.resolve({
      status: 200,
      json() {
        return Promise.resolve({
          user_history: [],
          last_sync: 11,
          settings: {
            time_stamp: 11,
          },
        })
      }
    }));
    const settings = {
      setting1: 'string',
      setting2: 12,
      setting3: 'another string',
    };
    const currHistory = await Sefaria.history.syncHistory(()=>{}, settings);
    expect(fetch.mock.calls.length).toBe(1);
    const fetchParams = fetch.mock.calls[0];
    expect(fetchParams[1].method).toBe("POST");
    expect(fetchParams[1].headers.Authorization).toBe(`Bearer ${auth.token}`);
    expect(fetchParams[1].headers['Content-Type']).toBe('application/x-www-form-urlencoded;charset=UTF-8');
    expect(Sefaria.api.urlFormDecode(fetchParams[1].body)).toEqual({
      user_history: JSON.stringify(lastSyncItems),
      last_sync: '0',
      settings: JSON.stringify(settings),
    });
    expect((await AsyncStorage.getItem('lastSyncTime'))).toBe('11');
    expect((await AsyncStorage.getItem('savedItems'))).toBe('[]');
    expect((await AsyncStorage.getItem('lastPlace'))).toBe(JSON.stringify([lastSyncItems[0]]));
    expect((await AsyncStorage.getItem('history'))).toBe(JSON.stringify(lastSyncItems));
    expect(currHistory).toEqual(lastSyncItems);
    expect((await AsyncStorage.removeItem('lastSyncItems'))).toBeNull();
  });

  test('sync web history', async () => {
    const webHistory = [
      {
        ref: "Genesis 1:6",
        he_ref: "בראשית א:ו",
        versions: {},
        book: "Genesis",
        language: "english",
        time_stamp: 1,
      },
      {
        ref: "Genesis 1:5",
        he_ref: "בראשית א:ה",
        versions: {},
        book: "Genesis",
        language: "english",
        time_stamp: 0,
        saved: true,
      }
    ];
    await AsyncStorage.removeItem('history');
    await AsyncStorage.removeItem('lastSyncItems');
    await AsyncStorage.removeItem('savedItems');
    await AsyncStorage.removeItem('lastSyncTime');
    const auth = { uid: 1, token: 2 };
    Sefaria.api.getAuthToken = jest.fn(() => {
      Sefaria._auth = auth;
    });
    fetch = jest.fn(() => Promise.resolve({
      status: 200,
      json() {
        return Promise.resolve({
          user_history: webHistory,
          last_sync: 11,
          settings: {
            time_stamp: 11,
          },
        })
      }
    }));
    const currHistory = await Sefaria.history.syncHistory(()=>{}, {});
    expect(fetch.mock.calls.length).toBe(1);
    expect(fetch.mock.calls[0][1].method).toBe("POST");
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe(`Bearer ${auth.token}`);
    expect(fetch.mock.calls[0][1].headers['Content-Type']).toBe('application/x-www-form-urlencoded;charset=UTF-8');

    expect((await AsyncStorage.getItem('lastSyncTime'))).toBe('11');
    expect((await AsyncStorage.getItem('savedItems'))).toBe(JSON.stringify([webHistory[1]]));
    expect((await AsyncStorage.getItem('lastPlace'))).toBe(JSON.stringify([webHistory[0]]));
    expect((await AsyncStorage.getItem('history'))).toBe(JSON.stringify(webHistory));
    expect(currHistory).toEqual(webHistory);
    expect((await AsyncStorage.removeItem('lastSyncItems'))).toBeNull();
  });

  test('sync both web and mobile history', async () => {
    const webHistory = [
      {
        ref: "Genesis 1:6",
        he_ref: "בראשית א:ו",
        versions: {},
        book: "Genesis",
        language: "english",
        time_stamp: 2,
      },
      {
        ref: "Genesis 1:5",
        he_ref: "בראשית א:ה",
        versions: {},
        book: "Genesis",
        language: "english",
        time_stamp: 0,
        saved: true,
      }
    ];
    const lastSyncItems = [
      {
        ref: "Genesis 1:7",
        he_ref: "בראשית א:ו",
        versions: {},
        book: "Genesis",
        language: "english",
        time_stamp: 3,
        saved: true,
      },
      {
        ref: "Genesis 1:8",
        he_ref: "בראשית א:ה",
        versions: {},
        book: "Genesis",
        language: "english",
        time_stamp: 1,
      }
    ];

    const finalHistory = [lastSyncItems[0], webHistory[0], lastSyncItems[1], webHistory[1]];
    await AsyncStorage.setItem('lastSyncItems', JSON.stringify(lastSyncItems));
    await AsyncStorage.removeItem('history');
    await AsyncStorage.setItem('savedItems', JSON.stringify([lastSyncItems[0]]));
    await AsyncStorage.removeItem('lastSyncTime');
    const auth = { uid: 1, token: 2 };
    Sefaria.api.getAuthToken = jest.fn(() => {
      Sefaria._auth = auth;
    });
    fetch = jest.fn(() => Promise.resolve({
      status: 200,
      json() {
        return Promise.resolve({
          user_history: webHistory,
          last_sync: 11,
          settings: {
            time_stamp: 11,
          },
        })
      }
    }));
    const currHistory = await Sefaria.history.syncHistory(()=>{}, {});
    expect(fetch.mock.calls.length).toBe(1);
    expect(fetch.mock.calls[0][1].method).toBe("POST");
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe(`Bearer ${auth.token}`);
    expect(fetch.mock.calls[0][1].headers['Content-Type']).toBe('application/x-www-form-urlencoded;charset=UTF-8');

    expect((await AsyncStorage.getItem('lastSyncTime'))).toBe('11');
    expect((await AsyncStorage.getItem('savedItems'))).toBe(JSON.stringify([lastSyncItems[0], webHistory[1]]));
    expect((await AsyncStorage.getItem('lastPlace'))).toBe(JSON.stringify([lastSyncItems[0]]));
    expect((await AsyncStorage.getItem('history'))).toBe(JSON.stringify(finalHistory));
    expect(currHistory).toEqual(finalHistory);
    expect((await AsyncStorage.removeItem('lastSyncItems'))).toBeNull();
  });

  test('syncEmpty', async () => {
    await AsyncStorage.removeItem('history');
    await AsyncStorage.removeItem('lastSyncItems');
    await AsyncStorage.removeItem('savedItems');
    await AsyncStorage.removeItem('lastSyncTime');
    const auth = { uid: 1, token: 2 };
    Sefaria.api.getAuthToken = jest.fn(() => {
      Sefaria._auth = auth;
    });
    fetch = jest.fn(() => Promise.resolve({
      status: 200,
      json() {
        return Promise.resolve({
          user_history: [],
          last_sync: 11,
          settings: {
            time_stamp: 11,
          },
        })
      }
    }));
    await Sefaria.history.syncHistory(()=>{}, {});
    expect(fetch.mock.calls.length).toBe(1);
    expect(fetch.mock.calls[0][1].method).toBe("POST");
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe(`Bearer ${auth.token}`);
    expect(fetch.mock.calls[0][1].headers['Content-Type']).toBe('application/x-www-form-urlencoded;charset=UTF-8');

    expect((await AsyncStorage.getItem('lastSyncTime'))).toBe('11');
    expect((await AsyncStorage.getItem('savedItems'))).toBe('[]');
    expect((await AsyncStorage.getItem('lastPlace'))).toBe('[]');
    expect((await AsyncStorage.getItem('history'))).toBe('[]');

  });
});
