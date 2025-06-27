/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';


// Apollo
import client from './src/services/api';
import { ApolloProvider } from '@apollo/client';

const breakapp = () => (
    <ApolloProvider client={client}>
        <App/>
    </ApolloProvider>
)

AppRegistry.registerComponent(appName, () => breakapp);
