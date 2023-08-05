async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const ERupiERC20 = await ethers.getContractFactory("ERupi");
  const ERupi = await ERupiERC20.deploy();
  await ERupi.waitForDeployment();

  const USDCERC20 = await ethers.getContractFactory("USDC");
  const USDC = await USDCERC20.deploy();
  await USDC.waitForDeployment();

  const UNIERC20 = await ethers.getContractFactory("UniswapV2ERC20");
  const uniToken = await UNIERC20.deploy();
  await uniToken.waitForDeployment();


  const UniswapV2Factory = await ethers.getContractFactory("UniswapV2Factory");
  const factory = await UniswapV2Factory.deploy(deployer.address);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();

  //console.log({ address: factory.address, target: factory.target })

  const WETH = await ethers.getContractFactory("WETH9");
  const weth = await WETH.deploy();
  await weth.waitForDeployment();
  const wethAddress = await weth.getAddress();

  const amountToDeposit = ethers.parseEther("200");  
  await weth.deposit({ value: amountToDeposit });

  const UniswapV2Router = await ethers.getContractFactory("UniswapV2Router");
  const router = await UniswapV2Router.deploy(factoryAddress, wethAddress);
  await router.waitForDeployment();



  // console.log("Router deployed to:", router.address);
  console.log("Factory deployed to:", factory.getAddress());
  console.log("Router deployed", router.getAddress());
  console.log("ERupiERC20 deployed to:", ERupi.getAddress());
  console.log("USDC deployed to:", USDC.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
