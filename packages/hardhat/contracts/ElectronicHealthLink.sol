// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

struct Document {
    address patient;
    address doctor;
    uint256 documentType;
    uint256 createdAt;
    string ipfsLink;
    string encryptedSymmetricKey;
}

struct Grant {
    uint256 start;
    uint256 end;
    uint256[] documentTypes;
}

contract ElectronicHealthLink {
    //Declare an Event
    //event Deposit(address indexed _from, bytes32 indexed _id, uint _value);

    //Emit an event
    //emit Deposit(msg.sender, _id, msg.value);

    event RevokeAccess(address indexed _revokeAddress, address _patient);
    event GrantAccess(
        address indexed _grantAddress,
        uint256 _start,
        uint256 _end,
        uint256[] _documentTypes,
        address _patient
    );
    event PushDocument(
        address indexed _patient,
        uint256 _documentType,
        string _ipfsLink,
        address indexed _doctor
    );

    mapping(address => Document[]) documents;
    //A mapping of the addresses of PATIENTS to DOCTORS with the grant they have
    mapping(address => mapping(address => Grant)) grantlist;

    Document[] r;

    //bool public condition  ;

    /*    function setCondition (bool value) public {
        condition = value;

    }
    */

    function revokeAccess(address _revokeAddress) public {
        delete grantlist[msg.sender][_revokeAddress];
        emit RevokeAccess(_revokeAddress, msg.sender);
    }

    function grantAccess(
        address _doctor,
        uint256 _start,
        uint256 _end,
        uint256[] calldata _documentTypes
    ) public {
        Grant memory g = Grant({
            start: _start,
            end: _end,
            documentTypes: _documentTypes
        });
        grantlist[msg.sender][_doctor] = g;
        emit GrantAccess(_doctor, _start, _end, _documentTypes, msg.sender);
    }

    function pushDocument(
        address _patient,
        uint256 _documentType,
        string calldata _ipfsLink,
        string calldata _encryptedSymmetricKey,
        address _doctor
    ) public {
        Document memory d = Document({
            patient: _patient,
            documentType: _documentType,
            createdAt: block.timestamp,
            ipfsLink: _ipfsLink,
            encryptedSymmetricKey: _encryptedSymmetricKey,
            doctor: _doctor
        });
        documents[_patient].push(d);

        emit PushDocument(_patient, _documentType, _ipfsLink, _doctor);
    }

    function checkAccess(
        address _patient,
        address _doctor,
        uint256 _documentType
    ) public view returns (bool) {
        if (
            grantlist[_patient][_doctor].start <= block.timestamp &&
            grantlist[_patient][_doctor].end >= block.timestamp
        ) {
            for (
                uint256 i = 0;
                i < grantlist[_patient][_doctor].documentTypes.length;
                i++
            ) {
                if (
                    grantlist[_patient][_doctor].documentTypes[i] ==
                    _documentType
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    function getDocumentsFromGrant(
        address _patient,
        address _doctor,
        uint256 _docType
    ) public view returns (Document[] memory) {
        Document[] memory d;
        Document memory currentDoc;
        d = documents[_patient];

        uint256 filterArrayLength;
        uint256 i = 0;

        //check if we have documents
        for (i = 0; i < d.length; i++) {
            //Filter
            currentDoc = d[i];
            if (currentDoc.doctor == _doctor) {
                filterArrayLength++;
            }
        }
        require(filterArrayLength > 0, "Nothing");

        // Set the filterArrayLength for when we have documents
        Document[] memory filterArray = new Document[](filterArrayLength);

        //if we have documents, then loop and find the documents selected by input parameters
        for (i = 0; i < d.length; i++) {
            //Filter
            currentDoc = d[i];
            if (currentDoc.doctor == _doctor) {
                filterArray[i] = currentDoc;
            }
        }
        return filterArray;
    }

    function getDocumentsAll(address _patient)
        public
        view
        returns (Document[] memory)
    {
        Document[] memory d;
        Document memory currentDoc;
        d = documents[_patient];

        uint256 filterArrayLength;
        uint256 i = 0;

        //check if we have documents
        for (i = 0; i < d.length; i++) {
            //Filter
            currentDoc = d[i];

            filterArrayLength++;
        }
        require(filterArrayLength > 0, "Nothing");

        // Set the filterArrayLength for when we have documents
        Document[] memory filterArray = new Document[](filterArrayLength);

        //if we have documents, then loop and find the documents selected by input parameters
        for (i = 0; i < d.length; i++) {
            //Filter
            currentDoc = d[i];

            filterArray[i] = currentDoc;
        }
        return filterArray;
    }
}
