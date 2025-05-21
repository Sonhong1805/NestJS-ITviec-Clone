import { HttpException, HttpStatus } from '@nestjs/common';

export const convertStringSortToObject = (sort: string) => {
  try {
    const sortArr = sort.split(',');
    return Object.fromEntries(
      sortArr.map((e) => [e.split(':')[0], e.split(':')[1]]),
    );
  } catch (error) {
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }
};

export const convertKeySortJob = (sortObj: any) => {
  const keyMap = {
    title: 'job.title',
    minSalary: 'job.minSalary',
    maxSalary: 'job.maxSalary',
    createdAt: 'job.createdAt',
    updatedAt: 'job.updatedAt',
  };

  const sortConverted = {};
  for (const key of Object.keys(sortObj)) {
    if (keyMap[key]) {
      sortConverted[keyMap[key]] = sortObj[key];
    }
  }

  return sortConverted;
};

export const convertKeySortApplication = (sortObj: any) => {
  const keyMap = {
    title: 'job.title',
    fullName: 'application.fullName',
    phoneNumber: 'application.phoneNumber',
    createdAt: 'application.createdAt',
    updatedAt: 'application.updatedAt',
  };

  const sortConverted = {};
  for (const key of Object.keys(sortObj)) {
    if (keyMap[key]) {
      sortConverted[keyMap[key]] = sortObj[key];
    }
  }

  return sortConverted;
};
