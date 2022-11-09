import React from 'react';
import {BrowserRouter} from "react-router-dom";
import {Route, Routes} from "react-router";
import {routes} from "./App.Routes";
import {configureChains, createClient, defaultChains, WagmiConfig} from "wagmi";
import {publicProvider} from 'wagmi/providers/public';
import {InjectedConnector} from "wagmi/connectors/injected";
import {WalletConnectConnector} from 'wagmi/connectors/walletConnect';

const { chains, provider } = configureChains(defaultChains, [publicProvider()])

// const client = createClient({
//   autoConnect: true,
//   provider: getDefaultProvider(),
// })

// export const goarliCustomTestnet = {
//   id: 5,
//   name: "Goerli",
//   network: "goerli",
//   nativeCurrency: {
//     decimals: 18,
//     name: "GoerliETH",
//     symbol: "GoerliETH",
//   },
//   rpcUrls: {
//     default: "---",
//   },
//   blockExplorers: {
//     default: {
//       name: "Goerli explorer",
//       url: "https://blockscout.chiadochain.net",
//     },
//   },
//   testnet: true,
// };

const client = createClient({
  autoConnect: true,
  connectors: [
    new InjectedConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        qrcode: true,
      },
    }),
  ],
  provider,
})

function App(): JSX.Element {

  return (
    <WagmiConfig client={client}>
      <BrowserRouter>
        <Routes>
          {
            routes.map(r => {
              if(r.protected)
                return <Route path={r.path} key={r.path} element={r.component} />
              else return <Route path={r.path} key={r.path} element={r.component} />
            })
          }
        </Routes>
      </BrowserRouter>
    </WagmiConfig>
  );

}

export default App;
