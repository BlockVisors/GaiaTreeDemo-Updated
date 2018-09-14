var Migrations = artifacts.require('lifecycle/Migrations')

module.exports = function (deployer) {
    deployer.deploy(Migrations);
}