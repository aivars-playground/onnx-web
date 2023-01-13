/* eslint-disable no-console */
import { mustExist } from '@apextoaster/js-utils';
import { merge } from 'lodash';
import * as React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createStore } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { makeClient } from './api/client.js';
import { OnnxWeb } from './components/OnnxWeb.js';
import { loadConfig } from './config.js';
import { ClientContext, createStateSlices, OnnxState, StateContext } from './state.js';

const { createContext } = React;

export async function main() {
  // load config from GUI server
  const config = await loadConfig();

  // use that to create an API client
  const client = makeClient(config.api.root);

  // load full params from the API server and merge with the initial client config
  const params = await client.params();
  merge(params, config.params);

  // prep zustand with a slice for each tab, using local storage
  const {
    createDefaultSlice,
    createHistorySlice,
    createImg2ImgSlice,
    createInpaintSlice,
    createTxt2ImgSlice,
  } = createStateSlices(params);
  const state = createStore<OnnxState, [['zustand/persist', OnnxState]]>(persist((...slice) => ({
    ...createTxt2ImgSlice(...slice),
    ...createImg2ImgSlice(...slice),
    ...createInpaintSlice(...slice),
    ...createHistorySlice(...slice),
    ...createDefaultSlice(...slice),
  }), {
    name: 'onnx-web',
    storage: createJSONStorage(() => localStorage),
    version: 3,
  }));

  // prep react-query client
  const query = new QueryClient();

  // prep react-dom
  const appElement = mustExist(document.getElementById('app'));
  const app = ReactDOM.createRoot(appElement);

  // go
  app.render(<QueryClientProvider client={query}>
    <ClientContext.Provider value={client}>
      <StateContext.Provider value={state}>
        <OnnxWeb client={client} config={params} />
      </StateContext.Provider>
    </ClientContext.Provider>
  </QueryClientProvider>);
}

window.addEventListener('load', () => {
  console.log('launching onnx-web');
  main().catch((err) => {
    console.error('error in main', err);
  });
}, false);
