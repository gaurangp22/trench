export type EscrowIDL = {
    version: "0.1.0";
    name: "trench_escrow";
    instructions: [
        {
            name: "initialize";
            accounts: [
                { name: "escrowAccount"; isMut: true; isSigner: true },
                { name: "user"; isMut: true; isSigner: true },
                { name: "systemProgram"; isMut: false; isSigner: false }
            ];
            args: [];
        },
        {
            name: "fundEscrow";
            accounts: [
                { name: "escrowAccount"; isMut: true; isSigner: false },
                { name: "depositor"; isMut: true; isSigner: true },
                { name: "systemProgram"; isMut: false; isSigner: false }
            ];
            args: [
                { name: "amount"; type: "u64" }
            ];
        },
        {
            name: "releasePayment";
            accounts: [
                { name: "escrowAccount"; isMut: true; isSigner: false },
                { name: "initializer"; isMut: true; isSigner: true },
                { name: "recipient"; isMut: true; isSigner: false }
            ];
            args: [
                { name: "amount"; type: "u64" }
            ];
        }
    ];
    accounts: [
        {
            name: "EscrowAccount";
            type: {
                kind: "struct";
                fields: [
                    { name: "initializer"; type: "publicKey" },
                    { name: "recipient"; type: "publicKey" },
                    { name: "amount"; type: "u64" },
                    { name: "state"; type: "u8" }
                ];
            };
        }
    ];
};

export const IDL: EscrowIDL = {
    version: "0.1.0",
    name: "trench_escrow",
    instructions: [
        {
            name: "initialize",
            accounts: [
                { name: "escrowAccount", isMut: true, isSigner: true },
                { name: "user", isMut: true, isSigner: true },
                { name: "systemProgram", isMut: false, isSigner: false }
            ],
            args: []
        },
        {
            name: "fundEscrow",
            accounts: [
                { name: "escrowAccount", isMut: true, isSigner: false },
                { name: "depositor", isMut: true, isSigner: true },
                { name: "systemProgram", isMut: false, isSigner: false }
            ],
            args: [
                { name: "amount", type: "u64" }
            ]
        },
        {
            name: "releasePayment",
            accounts: [
                { name: "escrowAccount", isMut: true, isSigner: false },
                { name: "initializer", isMut: true, isSigner: true },
                { name: "recipient", isMut: true, isSigner: false }
            ],
            args: [
                { name: "amount", type: "u64" }
            ]
        }
    ],
    accounts: [
        {
            name: "EscrowAccount",
            type: {
                kind: "struct",
                fields: [
                    { name: "initializer", type: "publicKey" },
                    { name: "recipient", type: "publicKey" },
                    { name: "amount", type: "u64" },
                    { name: "state", type: "u8" }
                ]
            }
        }
    ]
};
