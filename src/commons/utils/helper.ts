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
  const sortConverted = {};
  for (const key of Object.keys(sortObj)) {
    if (key === 'salary') {
      sortConverted['job.maxSalary'] = sortObj[key];
    }
    if (key === 'title') {
      sortConverted['job.title'] = sortObj[key];
    }
  }
  return sortConverted;
};
