import prisma from '../config/prisma.js';
import { createError } from '../utils/errors.js';
import { mapAddress } from '../utils/mapper.js';

type AddressInput = {
  label?: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault?: boolean;
};

export const listAddresses = async (userId: number) => {
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return addresses.map(mapAddress);
};

export const createAddress = async (userId: number, input: AddressInput) => {
  const address = await prisma.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return tx.address.create({
      data: {
        userId,
        label: input.label ?? null,
        recipientName: input.recipientName,
        phone: input.phone,
        addressLine: input.addressLine,
        city: input.city,
        province: input.province,
        postalCode: input.postalCode,
        isDefault: input.isDefault ?? false,
      },
    });
  });

  return mapAddress(address);
};

export const updateAddress = async (
  userId: number,
  addressId: number,
  input: AddressInput
) => {
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });

  if (!address) {
    throw createError('Address not found', 404);
  }

  const updatedAddress = await prisma.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return tx.address.update({
      where: { id: addressId },
      data: {
        label: input.label ?? null,
        recipientName: input.recipientName,
        phone: input.phone,
        addressLine: input.addressLine,
        city: input.city,
        province: input.province,
        postalCode: input.postalCode,
        isDefault: input.isDefault ?? false,
      },
    });
  });

  return mapAddress(updatedAddress);
};

export const deleteAddress = async (userId: number, addressId: number) => {
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });

  if (!address) {
    throw createError('Address not found', 404);
  }

  const deleted = await prisma.address.delete({
    where: { id: addressId },
  });

  return mapAddress(deleted);
};
