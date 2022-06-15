#!/usr/bin/env bash


yarn compile

#yarn deploy --network localhost
#yarn deploy --network mumbai
yarn deploy --network polygon


rm  "./packages/frontend/src/lib/hardhat_contracts.json"
#rm -rf "./packages/frontend/types/typechain/"

#mkdir -p "./packages/frontend/hardhat_contracts.json"
#mkdir -p "./packages/frontend/types/typechain/"



cp  "./packages/hardhat/hardhat_contracts.json" "./packages/frontend/src/lib/hardhat_contracts.json"
#cp -R -a "./packages/hardhat/typechain/." "./packages/frontend/typechain/typechain/"