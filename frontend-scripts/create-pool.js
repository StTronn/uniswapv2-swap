const ethers = require('ethers');
const erupiTokenABI = require('../artifacts/contracts/ERupi.sol/Erupi.json').abi; // replace with your actual ABI path
const wethTokenABI = require('../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json').abi; // replace with your actual ABI path
const routerABI = require('../artifacts/contracts/UniswapV2Router.sol/UniswapV2Router.json').abi; // replace with your actual ABI path
const factoryABI = require('../artifacts/contracts/UniswapV2Factory.sol/UniswapV2Factory.json').abi; // replace with your actual ABI path
const pairABI = require('../artifacts/contracts/UniswapV2Pair.sol/UniswapV2Pair.json').abi; // replace with your actual ABI path

// ... the previous code

async function main() {

  const provider = ethers.getDefaultProvider('http://localhost:8545'); // replace with your actual provider
  const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // replace with your actual private key
  const account = new ethers.Wallet(privateKey, provider);

  const erupiAddress = '0x5fbdb2315678afecb367f032d93f642f64180aa3'; // replace with your actual token address
  const wethAddress = '0xdc64a140aa3e981100a9beca4e685f962f0cf6c9'; // replace with your actual weth address
  const routerAddress = '0x0165878a594ca255338adfa4d48449f69242eb8f'; // replace with your actual router address
  const factoryAddress = '0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9';


  const erupiToken = new ethers.Contract(erupiAddress, erupiTokenABI, account);
  const wethToken = new ethers.Contract(wethAddress, wethTokenABI, account);
  const router = new ethers.Contract(routerAddress, routerABI, account);
  const factory = new ethers.Contract(factoryAddress, factoryABI, account);


  //approveRouter
  const erupiApproveTx = await erupiToken.approve(routerAddress, ethers.parseEther('100'));
  await erupiApproveTx.wait(); // Wait for the transaction to be mined

  const wethApproveTx = await wethToken.approve(routerAddress, ethers.parseEther('100'));
  await wethApproveTx.wait(); // Wait for the transaction to be mined

  const amountADesired = ethers.parseEther('100'); // replace with desired amount of ERupi tokens
  const amountBDesired = ethers.parseEther('10'); // replace with desired amount of WETH
  const amountAMin = ethers.parseEther('90'); // replace with minimum amount of ERupi tokens you accept to account for price movement
  const amountBMin = ethers.parseEther('9'); // replace with minimum amount of WETH you accept to account for price movement
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time


  //Add liquidity
  const addLiquidity = await router.addLiquidity(
    erupiAddress,
    wethAddress,
    amountADesired,
    amountBDesired,
    amountAMin,
    amountBMin,
    account.address,
    deadline,
  );

  console.log('Liquidity added');
  const pairAddress = await factory.getPair(erupiAddress, wethAddress);
  const pair = new ethers.Contract(pairAddress, pairABI, account);

  // Fetch LP token balance (liquidity provided)
  const liquidityProvided = await pair.balanceOf(account.address);
  console.log('Liquidity Provided:', ethers.formatEther(liquidityProvided));

  // Fetch Reserves and Calculate the Price
  let reserves = await pair.getReserves();
  let reserve0 = ethers.formatEther(reserves._reserve0);
  let reserve1 = ethers.formatEther(reserves._reserve1);

  let price = reserves._reserve0 / reserves._reserve1;
  console.log({ erupi_reserve: reserve0, usd_reserve: reserve1 });
  console.log('Price of Erupi in terms of USD:', price);


  const amountIn = ethers.parseEther('1'); // 1 WETH
  const amountOutMin = ethers.parseUnits('1', 'wei'); // We set a low limit to avoid errors due to price fluctuation, replace with a better estimate
  const path = [wethAddress, erupiAddress];
  const to = account.address;

  erupiBalance = await erupiToken.balanceOf(account.address);
  console.log("Account Balance ERupi: ", ethers.formatEther(erupiBalance));
  wethBalance = await wethToken.balanceOf(account.address);
  console.log("Account Balance USD", ethers.formatEther(wethBalance));

  await router.swapExactETHForTokens(amountOutMin, path, to, deadline, { value: amountIn });

  // Fetch Reserves and Calculate the Updated Price
  reserves = await pair.getReserves();
  price = reserves._reserve0 / reserves._reserve1;

  reserve0 = ethers.formatEther(reserves._reserve0);
  reserve1 = ethers.formatEther(reserves._reserve1);
  console.log({ erupi_reserve: reserve0, usd_reserve: reserve1 });
  console.log('Updated Price of Erupi in terms of usd:', price);

  erupiBalance = await erupiToken.balanceOf(account.address);
  console.log("Account Balance ERupi: ", ethers.formatEther(erupiBalance));
  wethBalance = await wethToken.balanceOf(account.address);
  console.log("Account Balance USD", ethers.formatEther(wethBalance));
}


main().catch(console.error);
