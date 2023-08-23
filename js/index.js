//Function call
loadInitialData("sevenDays");
connectMe("metamask_wallet");
function connectWallet() {}

function openTab(event, name) {
  contractCall = name;
  getSeletectedTab(name);
  loadInitialData(name);
}

async function loadInitialData(sClass) {
  try {
    clearInterval(countDownGlobal);
    let cObj = new web3Main.eth.Contract(
      SELECT_CONTRACT[_NETWORK_ID].STACKING.abi,
      SELECT_CONTRACT[_NETWORK_ID].STACKING[sClass].address
    );

    //ID ELEMENT DATA
    let totalUsers = await cObj.methods.getTotalUsers().call();
    let cApy = await cObj.methods.getAPY().call();
    //GET USER
    let userDetail = await cObj.methods.getUser(currentAddress).call();

    const user = {
      lastRewardCalculationTime: userDetail.lastRewardCalculationTime,
      lastStakeTime: userDetail.lastStakeTime,
      rewardAmount: userDetail.rewardAmount,
      rewardsClaimedSoFar: userDetail.rewardsClaimedSoFar,
      stakeAmount: userDetail.stakeAmount,
      address: currentAddress,
    };

    localStorage.setItem("User", JSON.stringify(user));

    let userDetailBal = userDetail.stakeAmount / 10 ** 18;

    document.getElementById(
      "total-locked-user-token"
    ).innerHTML = `${userDetailBal}`;

    //ELEMENTS --TD
    document.getElementById(
      "num-of-stackers-value"
    ).innerHTML = `${totalUsers}`;

    document.getElementById("apy-value-feature").innerHTML = `${cApy}`;

    //CLASS ELEMENT DATA
    let totalLockedTokens = await cObj.methods.getTotalStakedTokens().call();
    let earlyUnstakeFee = await cObj.methods
      .getEarlyUnstakeFeePercantage()
      .call();

    //ELEMENTS --CLASS
    document.getElementById("total-locked-tokens-value").innerHTML = `${
      totalLockedTokens / 10 ** 18
    } ${SELECT_CONTRACT[_NETWORK_ID].TOKEN.symbol}`;

    document
      .querySelectorAll(".early-unstake-fee-value")
      .forEach(function (element) {
        element.innerHTML = `${earlyUnstakeFee / 100}%`;
      });

    if (sClass == "sevenDays") {
      maxA = `${(10).toLocaleString()} ${
        SELECT_CONTRACT[_NETWORK_ID].TOKEN.symbol
      }`;
      document
        .querySelectorAll(".Maximum-Staking-Amount")
        .forEach(function (element) {
          element.innerHTML = `${maxA}`;
        });
    } else if (sClass == "tenDays") {
      maxA = `${(1000).toLocaleString()} ${
        SELECT_CONTRACT[_NETWORK_ID].TOKEN.symbol
      }`;
      document
        .querySelectorAll(".Maximum-Staking-Amount")
        .forEach(function (element) {
          element.innerHTML = `${maxA}`;
        });
    } else if (sClass == "thirtyDays") {
      maxA = `${(1000).toLocaleString()} ${
        SELECT_CONTRACT[_NETWORK_ID].TOKEN.symbol
      }`;
      document
        .querySelectorAll(".Maximum-Staking-Amount")
        .forEach(function (element) {
          element.innerHTML = `${maxA}`;
        });
    } else if (sClass == "ninetyDays") {
      maxA = `${(1000).toLocaleString()} ${
        SELECT_CONTRACT[_NETWORK_ID].TOKEN.symbol
      }`;
      document
        .querySelectorAll(".Maximum-Staking-Amount")
        .forEach(function (element) {
          element.innerHTML = `${maxA}`;
        });
    }

    let minStakeAmount = await cObj.methods.getMinimumStakingAmount().call();
    minStakeAmount = Number(minStakeAmount);
    let minA;

    if (minStakeAmount) {
      minA = `${(minStakeAmount / 10 ** 18).toLocaleString()} ${
        SELECT_CONTRACT[_NETWORK_ID].TOKEN.symbol
      }`;
    } else {
      minA = "N/A";
    }

    document
      .querySelectorAll(".Minimum-Staking-Amount")
      .forEach(function (element) {
        element.innerHTML = `${minA}`;
      });

    // document
    //   .querySelectorAll(".Maximum-Staking-Amount")
    //   .forEach(function (element) {
    //     element.innerHTML = `${(5000).toLocaleString()} ${
    //       SELECT_CONTRACT[_NETWORK_ID].TOKEN.symbol
    //     }`;
    //   });

    let isStakingPaused = await cObj.methods.getStakingStatus().call();
    let isStakingPausedText;

    let startDate = await cObj.methods.getStakeStartDate().call();
    startDate = Number(startDate) * 1000;

    let endDate = await cObj.methods.getStakeEndDate().call();
    endDate = Number(endDate) * 1000;

    let stakeDays = await cObj.methods.getStakedDayes().call();

    let days = Math.floor(Number(stakeDays) / (3600 * 24));

    let dayDisplay = days > 0 ? days + (days == 1 ? "day, " : " days, ") : "";

    document.querySelectorAll(".Lock-period-value").forEach(function (element) {
      element.innerHTML = `${dayDisplay}`;
    });

    let rewardBal = await cObj.methods
      .getUserEstimatedReward()
      .call({ from: currentAddress });

    document.getElementById("user-reward-balance-value").value = `Reward:${
      rewardBal / 10 ** 18
    } ${SELECT_CONTRACT[_NETWORK_ID].TOKEN.symbol}`;

    //USER TOKEN BALANCE
    let balMainUSer = currentAddress
      ? await ocontractToken.methods.balanceOf(currentAddress).call()
      : "";

    balMainUSer = Number(balMainUSer) / 10 ** 18;
    document.getElementById(
      "user-token-balance"
    ).innerHTML = `Balance:${balMainUSer}`;

    let currentDate = new Date().getTime();

    if (isStakingPaused) {
      isStakingPausedText = "Paused";
    } else if (currentDate < startDate) {
      isStakingPausedText = "Locked";
    } else if (currentDate > endDate) {
      isStakingPausedText = "Ended";
    } else {
      isStakingPausedText = "Active";
    }

    document
      .querySelectorAll(".active-status-stacking")
      .forEach(function (element) {
        element.innerHTML = `${isStakingPausedText}`;
      });

    if (currentDate > startDate && currentDate < endDate) {
      const ele = document.getElementById("countdown-time-value");
      genrateCountDown(ele, endDate);

      document.getElementById(
        "countdown-title-value"
      ).innerHTML = `Staking Ends In`;
    }

    if (currentDate < startDate) {
      const ele = document.getElementById("countdown-time-value");
      genrateCountDown(ele, endDate);

      document.getElementById(
        "countdown-title-value"
      ).innerHTML = `Staking Started In`;
    }

    document.querySelectorAll(".apy-value").forEach(function (element) {
      element.innerHTML = `${cApy}%`;
    });
  } catch (error) {
    console.log(error);
  }
}

function genrateCountDown(ele, claimDate) {
  clearInterval(countDownGlobal);

  //Set the date we are counting down to.
  var countdownDate = new Date(claimDate).getTime();

  //Update the count down every 1 second
  countDownGlobal = setInterval(function () {
    //Get today's date and time
    var now = new Date().getTime();

    //Find the distance between now and the count down date
    var distance = countdownDate - now;

    //Time calculations for days, hour, minutes and seconds
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));

    var hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );

    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    ele.innerHTML =
      days + "d " + hours + "h " + minutes + "m " + seconds + "s ";

    if (distance < 0) {
      clearInterval(countDownGlobal);
      ele.html("Refresh Page");
    }
  }, 1000);
}

async function connectMe(_provider) {
  try {
    let _comn_res = await commonProviderDetector(_provider);
    if (!_comn_res) {
      console.log("Please Connect");
    } else {
      let sClass = getSeletectedTab();
    }
  } catch (error) {
    notyf.error(error.message);
  }
}

async function stacktokens() {
  try {
    let nTokens = document.getElementById("amount-to-stack-value-new").value;
    if (!nTokens) {
      return;
    }
    if (isNaN(nTokens) || nTokens == 0 || Number(nTokens) < 0) {
      console.log(`Invalid token amount`);
      return;
    }
    nTokens = Number(nTokens);

    let tokenToTransfer = addDecimal(nTokens, 18);

    console.log("tokenToTransfer", tokenToTransfer);

    let balMainUser = await ocontractToken.methods
      .balanceOf(currentAddress)
      .call();

    balMainUSer = Number(balMainUser) / 10 ** 18;

    console.log("balMainUser", balMainUser);

    if (balMainUser < nTokens) {
      notyf.error(
        `insufficient tokens on ${SELECT_CONTRACT[_NETWORK_ID].network_name}.\n Please buy some tokens
                `
      );
      return;
    }

    let sClass = getSeletectedTab(contractCall);

    console.log(sClass);
    let balMainAllowance = await ocontractToken.methods
      .allowance(
        currentAddress,
        SELECT_CONTRACT[_NETWORK_ID].STACKING[sClass].address
      )
      .call();

    if (Number(balMainAllowance) < Number(tokenToTransfer)) {
      approveTokenSpend(tokenToTransfer, sClass);
    } else {
      stackTokenMain(tokenToTransfer, sClass);
    }
  } catch (error) {
    console.log(error);
    notyf.dismiss(notification);
    notyf.error(formatEthErrorMsg(error));
  }
}

async function approveTokenSpend(_mint_fee_wei, sClass) {
  let gasEstimation;
  try {
    gasEstimation = await ocontractToken.methods
      .approve(
        SELECT_CONTRACT[_NETWORK_ID].STACKING[sClass].address,
        _mint_fee_wei
      )
      .estimateGas({
        from: currentAddress,
      });
  } catch (error) {
    console.log(error);
    notyf.error(formatEthErrorMsg(error));
    return;
  }
  ocontractToken.methods
    .approve(
      SELECT_CONTRACT[_NETWORK_ID].STACKING[sClass].address,
      _mint_fee_wei
    )
    .send({
      from: currentAddress,
      gas: gasEstimation,
    })
    .on("transactionHash", (hash) => {
      console.log("Transaction Hash:", hash);
    })
    .on("receipt", (receipt) => {
      console.log(receipt);
      stackTokenMain(_mint_fee_wei);
    })
    .catch((error) => {
      console.log(error);
      notyf.error(formatEthErrorMsg(error));
      return;
    });
}

async function stackTokenMain(_amount_wei, sClass) {
  let gasEstimation;
  let ocontractStacking = getContractObj(sClass);
  console.log(ocontractStacking);
  try {
    gasEstimation = await ocontractStacking.methods
      .stake(_amount_wei)
      .estimateGas({
        from: currentAddress,
      });
  } catch (error) {
    console.log(error);
    // notyf.error(formatEthErrorMsg(error));
    return;
  }

  ocontractStacking.methods
    .stake(_amount_wei)
    .send({
      from: currentAddress,
      gas: gasEstimation,
    })
    .on("receipt", (receipt) => {
      console.log(receipt);
      const receiptObj = {
        token: _amount_wei,
        from: receipt.from,
        to: receipt.to,
        blockHash: receipt.blockHash,
        blockNumber: receipt.blockNumber,
        cumulativeGasUsed: receipt.cumulativeGasUsed,
        effectiveGasPrice: receipt.effectiveGasPrice,
        gasUsed: receipt.gasUsed,
        status: receipt.status,
        transactionHash: receipt.transactionHash,
        type: receipt.type,
      };

      let transactionHistory = [];

      const allUserTransaction = localStorage.getItem("transaction");
      if (allUserTransaction) {
        transactionHistory = JSON.parse(localStorage.getItem("transaction"));
        transactionHistory.push(receiptObj);
        localStorage.setItem(
          "transactions",
          JSON.stringify(transactionHistory)
        );
      } else {
        transactionHistory.push(receiptObj);
        localStorage.setItem("transaction", JSON.stringify(transactionHistory));
      }
      console.log(allUserTransaction);
      window.location.href = "analytic.html";
    })
    .on("transactionHash", (hash) => {
      console.log("Transaction Hash:", hash);
    })
    .catch((error) => {
      console.log(error);
      notyf.error(formatEthErrorMsg(error));
      return;
    });
}

async function unstackTokens() {
  try {
    let nTokens = document.getElementById("amount-to-unstack-value").value;
    if (!nTokens) {
      return;
    }
    if (isNaN(nTokens) || nTokens == 0 || Number(nTokens) < 0) {
      notyf.error("Invalid token amount!");
      return;
    }
    nTokens = Number(nTokens);

    let tokenToTransfer = addDecimal(nTokens, 18);

    let sClass = getSeletectedTab(contractCall);
    let ocontractStacking = getContractObj(sClass);

    let balMainUser = await ocontractStacking.methods
      .getUser(currentAddress)
      .call();

    balMainUser = Number(balMainUser.stakeAmount) / 10 ** 18;

    if (balMainUser < nTokens) {
      notyf.erro(
        `insufficient staked tokens on ${SELECT_CONTRACT[_NETWORK_ID].network_name}!`
      );
      return;
    }

    unstackTokenMain(tokenToTransfer, ocontractStacking, sClass);
  } catch (error) {
    console.log(error);
    // notyf.dismiss(notification);
    // notyf.error(formatEthErrorMsg(error));
  }
}

async function unstackTokenMain(_amount_wei, ocontractStacking, sClass) {
  let gasEstimation;

  try {
    gasEstimation = await ocontractStacking.methods
      .unstake(_amount_wei)
      .estimateGas({
        from: currentAddress,
      });
  } catch (error) {
    console.log(error);
    // notyf.error(formatEthErrorMsg(error));
    return;
  }

  ocontractStacking.methods
    .unstake(_amount_wei)
    .send({
      from: currentAddress,
      gas: gasEstimation,
    })
    .on("receipt", (receipt) => {
      console.log(receipt);
      const receiptObj = {
        token: _amount_wei,
        from: receipt.from,
        to: receipt.to,
        blockHash: receipt.blockHash,
        blockNumber: receipt.blockNumber,
        cumulativeGasUsed: receipt.cumulativeGasUsed,
        effectiveGasPrice: receipt.effectiveGasPrice,
        gasUsed: receipt.gasUsed,
        status: receipt.status,
        transactionHash: receipt.transactionHash,
        type: receipt.type,
      };
      let transactionHistory = [];

      const allUserTransaction = localStorage.getItem("transaction");
      if (allUserTransaction) {
        transactionHistory = JSON.parse(localStorage.getItem("transaction"));
        transactionHistory.push(receiptObj);
        localStorage.setItem(
          "transactions",
          JSON.stringify(transactionHistory)
        );
      } else {
        transactionHistory.push(receiptObj);
        localStorage.setItem("transaction", JSON.stringify(transactionHistory));
      }
      console.log(allUserTransaction);
      window.location.href = "http://127.0.0.1:5500/analytic.html";
    })
    .on("transactionHash", (hash) => {
      console.log("Transaction Hash:", hash);
    })
    .catch((error) => {
      console.log(error);
      notyf.error(formatEthErrorMsg(error));
      return;
    });
}

async function claimTokens() {
  try {
    let sClass = getSeletectedTab(contractCall);
    let ocontractStacking = getContractObj(sClass);

    let rewardBal = await ocontractStacking.methods
      .getUserEstimatedReward()
      .call({ from: currentAddress });
    rewardBal = Number(rewardBal);

    console.log("rewwardbal", rewardBal);

    if (!rewardBal) {
      // notyf.dismiss(notification);
      // notyf.error(`insufficient reward token to claim`);
      return;
    }

    claimTokenMain(ocontractStacking, sClass);
  } catch (error) {
    console.log(error);
    // notyf.dismiss(notification);
    // notyf.error(formatEthErrorMsg(error));
  }
}

async function claimTokenMain(ocontractStacking, sClass) {
  let gasEstimation;
  try {
    gasEstimation = await ocontractStacking.methods.claimReward().estimateGas({
      from: currentAddress,
    });
    console.log("gasEstimation", gasEstimation);
  } catch (error) {
    console.log(error);
    notyf.error(formatEthErrorMsg(error));
    return;
  }
  ocontractStacking.methods
    .claimReward()
    .send({
      from: currentAddress,
      gas: gasEstimation,
    })
    .on("receipt", (receipt) => {
      console.log(receipt);
      const receiptObj = {
        token: _amount_wei,
        from: receipt.from,
        to: receipt.to,
        blockHash: receipt.blockHash,
        blockNumber: receipt.blockNumber,
        cumulativeGasUsed: receipt.cumulativeGasUsed,
        effectiveGasPrice: receipt.effectiveGasPrice,
        gasUsed: receipt.gasUsed,
        status: receipt.status,
        transactionHash: receipt.transactionHash,
        type: receipt.type,
      };
      let transactionHistory = [];

      const allUserTransaction = localStorage.getItem("transaction");
      if (allUserTransaction) {
        transactionHistory = JSON.parse(localStorage.getItem("transaction"));
        transactionHistory.push(receiptObj);
        localStorage.setItem(
          "transactions",
          JSON.stringify(transactionHistory)
        );
      } else {
        transactionHistory.push(receiptObj);
        localStorage.setItem("transaction", JSON.stringify(transactionHistory));
      }
      console.log(allUserTransaction);
      window.location.href = "http://127.0.0.1:5500/analytic.html";
    })
    .on("transactionHash", (hash) => {
      console.log("Transaction Hash:", hash);
    })
    .catch((error) => {
      console.log(error);
      notyf.error(formatEthErrorMsg(error));
      return;
    });
}
