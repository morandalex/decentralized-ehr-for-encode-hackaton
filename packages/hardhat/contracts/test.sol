// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;



contract Test {

    function checkAccess(address _patient,address _doctor,uint256 _documentType) public view returns (bool) {
     
         if (_patient == 0xceBcB8051519489cdc4e1e46Dc5a8AdEA772fc49 && _doctor == 0xAc7AE76728931DA8E35a365b02A88e050E52103D  && _documentType == 1 ) {
            return true;
        }

        return false;
    }



}