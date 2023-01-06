import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Container, Stack, Tab, Typography } from '@mui/material';
import * as React from 'react';
import { useQuery } from 'react-query';

import { ApiClient } from '../api/client.js';
import { Config } from '../config.js';
import { MODEL_LABELS, PLATFORM_LABELS } from '../strings.js';
import { QueryList } from './QueryList.js';
import { STALE_TIME, Txt2Img } from './Txt2Img.js';

const { useState } = React;

export interface OnnxWebProps {
  client: ApiClient;
  config: Config;
}

export function OnnxWeb(props: OnnxWebProps) {
  const { client, config } = props;

  const [tab, setTab] = useState('txt2img');
  const [model, setModel] = useState(config.default.model);
  const [platform, setPlatform] = useState(config.default.platform);

  const models = useQuery('models', async () => client.models(), {
    staleTime: STALE_TIME,
  });
  const platforms = useQuery('platforms', async () => client.platforms(), {
    staleTime: STALE_TIME,
  });

  return (
    <div>
      <Container>
        <Box sx={{ my: 4 }}>
          <Typography variant='h3' gutterBottom>
            ONNX Web
          </Typography>
        </Box>
        <Box sx={{ my: 4 }}>
          <Stack direction='row' spacing={2}>
            <QueryList
              id='models'
              labels={MODEL_LABELS}
              name='Model'
              result={models}
              value={model}
              onChange={(value) => {
                setModel(value);
              }}
            />
            <QueryList
              id='platforms'
              labels={PLATFORM_LABELS}
              name='Platform'
              result={platforms}
              value={platform}
              onChange={(value) => {
                setPlatform(value);
              }}
            />
          </Stack>
        </Box>
        <TabContext value={tab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={(_e, idx) => {
              setTab(idx);
            }}>
              <Tab label='txt2img' value='txt2img' />
              <Tab label='img2img' value='img2img' disabled />
              <Tab label='settings' value='settings' />
            </TabList>
          </Box>
          <TabPanel value='txt2img'>
            <Txt2Img client={client} config={config} model={model} platform={platform} />
          </TabPanel>
          <TabPanel value='img2img'>
            <Box>
              img2img using {model}
            </Box>
          </TabPanel>
          <TabPanel value='settings'>
            <Box>
              settings for onnx-web
            </Box>
          </TabPanel>
        </TabContext>
      </Container>
    </div>
  );
}
