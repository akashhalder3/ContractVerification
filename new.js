var solc = require('solc')
var fs = require('fs')
var Web3 = require('web3')

var web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/d5f7c412daab43f396fc8746915ab819"))

var solc_version = "v0.4.16+commit.d7661dd9"
var contracts_directory = "./contracts"
var contract_name = "Ballot"
var contract_filename = "Ballot.sol"
var is_optimized = 1
var contract_address = "0x514910771AF9Ca656af840dff83E8264EcF986CA"

var input = {
    language: 'Solidity',
    sources: {
      'test.sol': {
        content: 'import "lib.sol"; contract C { function f() public { L.f(); } }'
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*']
        }
      }
    }
  };
  
function findImports(path) {
if (path === 'lib.sol')
    return {
    contents:
        'library L { function f() internal returns (uint) { return 7; } }'
    };
else return { error: 'File not found' };
}


// getting the development snapshot
solc.loadRemoteVersion(solc_version, async function(err, solcSnapshot) {
  if (err) {
    console.log(err)
  } else {
    // NOTE: Use `solcSnapshot` here with the same interface `solc` has
    var output = JSON.parse(
        solc.compile(JSON.stringify(input), { import: findImports })
    )
    var compiled_bytecode;
    for (var contractName in output.contracts['test.sol']) {
        compiled_bytecode = "0x"+output.contracts['test.sol'][contractName].evm.bytecode.object
    }
    console.log('compiled_bytecode', compiled_bytecode)
    var blockchain_bytecode = await web3.eth.getCode("0xB8c77482e45F1F44dE1745F52C74426C631bDD52")
    console.log('blockchain_bytecode', blockchain_bytecode)

    processed_compiled_bytecode = processBytecode(compiled_bytecode);
    processed_blockchain_bytecode = processBytecode(blockchain_bytecode);
    if (processed_blockchain_bytecode == processed_compiled_bytecode) {
        console.log("Verified!")
    } else {
        console.log("Not Verified")
    }
  }
});


function processBytecode(bytecode) {
    try {
        let solc_minor = parseInt(solc_version.match(/v\d+?\.\d+?\.\d+?[+-]/gi)[0].match(/\.\d+/g)[0].slice(1))
        let solc_patch = parseInt(solc_version.match(/v\d+?\.\d+?\.\d+?[+-]/gi)[0].match(/\.\d+/g)[1].slice(1))

        if (solc_minor >= 4 && solc_patch >= 22) {
            var starting_point = bytecode.lastIndexOf('6080604052');
            var ending_point = bytecode.search('a165627a7a72305820');
            return bytecode.slice(starting_point, ending_point);
        } else if (solc_minor >= 4 && solc_patch >= 7) {
            var starting_point = bytecode.lastIndexOf('6060604052');
            var ending_point = bytecode.search('a165627a7a72305820');
            return bytecode.slice(starting_point, ending_point);
    } else {
        return bytecode;
    }
        
    } catch (error) {
        console.log(error)
    }
    // Semantic versioning
    
}