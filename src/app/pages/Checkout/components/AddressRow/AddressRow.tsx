'use client';

import React from 'react';
import clsx from 'clsx';
import s from './AddressRow.module.scss';

interface Address {
    id: string;
    title: string;
    street: string;
}

interface AddressRowProps {
    addresses: Address[];
    selectedAddressId: string | null;
    onSelect: (id: string) => void;
    onAddClick: () => void;
}

function AddressCard({ 
    id, 
    title, 
    street, 
    isSelected, 
    onSelect 
}: Address & { 
    isSelected: boolean; 
    onSelect: (id: string) => void;
}) {
    return (
        <div 
            className={clsx(s.addressCard, isSelected && s.addressCardActive)}
            onClick={() => onSelect(id)}
        >
            <span className={s.addressTitle}>{title}</span>
            <span className={s.addressStreet}>{street}</span>
        </div>
    );
}

function AddAddressCard({ onClick }: { onClick: () => void }) {
    return (
        <button className={s.addAddressCard} type="button" onClick={onClick}>
            <div className={s.plusCircle}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1V13M1 7H13" stroke="#999" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </div>
            <span>Додати адресу</span>
        </button>
    );
}

export default function AddressRow({ addresses, selectedAddressId, onSelect, onAddClick }: AddressRowProps) {
    return (
        <div className={s.addressRow}>
            {addresses.length === 0 ? (
                <AddAddressCard onClick={onAddClick} />
            ) : (
                <>
                    {addresses.map(addr => (
                        <AddressCard 
                            key={addr.id}
                            {...addr}
                            isSelected={selectedAddressId === addr.id}
                            onSelect={onSelect}
                        />
                    ))}
                    <AddAddressCard onClick={onAddClick} />
                </>
            )}
        </div>
    );
}
