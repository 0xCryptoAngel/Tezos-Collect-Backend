import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { QueryDomainDto, UpdateDomainDto } from './dto/domain.dto';
import { Domain, DomainDocument } from './schema/domain.schema';

@Injectable()
export class DomainService {
  constructor(
    @InjectModel(Domain.name)
    private readonly domainModel: Model<DomainDocument>,
  ) {}

  async testFunction() {
    // await this.domainModel.updateMany(
    //   {
    //     isForAuction: true,
    //   },
    //   { isForAuction: false },
    // );
    // const domains = await this.domainModel.find();
    // await this.domainModel
    //   .deleteMany({ _id: { $gt: '634b6b5273871fad49b322fd' } })
    //   .exec();
  }

  async findAll(): Promise<Domain[]> {
    const all = await this.domainModel.find().exec();

    all.forEach((item) => {
      // item.lastSoldAt = new Date(
      //   new Date().getTime() - Math.random() * 87600 * 30 * 1000,
      // );
      /*const isForAuction = Math.random() > 0.5;
      item.isForAuction = isForAuction;
      if (isForAuction) {
        item.topBid = Math.random() * 150;
        item.auctionStartedAt = new Date(
          new Date().getTime() - Math.random() * 87600 * 15 * 1000,
        );
        item.auctionEndsAt = new Date(
          item.auctionStartedAt.getTime() + 87600 * 30 * 1000,
        );
        const isFeatured = Math.random() > 0.9;
        item.isFeatured = isFeatured;
      }
      item.save();*/
    });
    return all;
  }

  async getDomainsByCollectionId(collectionId: string): Promise<Domain[]> {
    const all = await this.domainModel.find({ collectionId }).exec();
    return all;
  }

  async updateOneByName(
    name: string,
    updateDomainDto: UpdateDomainDto,
  ): Promise<Domain> {
    delete updateDomainDto.lastSoldAt;
    delete updateDomainDto.lastSoldAmount;
    delete updateDomainDto.topOffer;
    delete updateDomainDto.topOfferer;

    if (
      updateDomainDto.name === updateDomainDto.name.split('').reverse().join('')
    )
      updateDomainDto.isPalindromes = true;
    else updateDomainDto.isPalindromes = false;

    return await this.domainModel
      .findOneAndUpdate(
        { name },
        { ...updateDomainDto },
        {
          returnDocument: 'after',
          upsert: true,
        },
      )
      .exec();
  }

  async getTopSaleDomains(): Promise<Domain[][]> {
    const durations = [
      {
        seconds: 87600, // 24 hr
      },
      {
        seconds: 87600 * 7, // 7 days
      },
      {
        seconds: 87600 * 30, // 30 days
      },
    ];
    const result: Domain[][] = await Promise.all(
      durations.map((item, index) => {
        return (
          this.domainModel
            .find({
              lastSoldAt: { $gt: new Date().getTime() - item.seconds * 1000 },
            })
            // .sort({ lastSoldAmount: -1 })
            // .limit(10)
            .exec()
        );
      }),
    );
    return result.map((result) =>
      result
        .sort((itemA, itemB) => itemB.lastSoldAmount - itemA.lastSoldAmount)
        .slice(0, 5),
    );
  }
  async getFeaturedAuctions(): Promise<Domain[]> {
    const result: Domain[] = await this.domainModel
      .find({ isFeatured: true, isForAuction: true })
      .limit(5)
      .exec();
    return result;
  }

  async getAuctionedDomains(): Promise<Domain[]> {
    const result: Domain[] = await this.domainModel
      .find({ isForAuction: true })
      .limit(20)
      .exec();
    return result;
  }
  async getDomainByName(name: string): Promise<DomainDocument> {
    let _domain = await this.domainModel.findOne({ name }).exec();
    if (_domain === null) {
      _domain = new this.domainModel({ name });
    }
    return _domain;
  }

  async queryDomain(
    queryDomainDto: QueryDomainDto,
  ): Promise<{ domains: DomainDocument[]; count: number }> {
    let domainQueryObj = this.domainModel.find({});

    const addQuery = (queryDomainDto: any, _query: any) => {
      const query = queryDomainDto.getQuery();
      if (query.$and) query.$and.push(_query);
      else {
        query.$and = [_query];
      }
      queryDomainDto.setQuery(query);
    };

    // searchOptions.domainListed
    if (queryDomainDto.searchOptions.domainListed === true)
      domainQueryObj = domainQueryObj.find({
        $or: [{ isForAuction: true }, { isForSale: true }],
      });
    else {
      domainQueryObj = domainQueryObj.find({
        $and: [{ isForAuction: false }, { isForSale: false }],
      });
    }

    // searchOptions.showType
    switch (queryDomainDto.searchOptions.showType) {
      case 'SHOW_ALL':
        break;
      case 'SHOW_AVAILABLE':
        if (queryDomainDto.searchOptions.domainListed === true)
          domainQueryObj = domainQueryObj.find({
            $or: [
              { isRegistered: false },
              {
                expiresAt: {
                  $lt: new Date(),
                },
              },
            ],
          });
        break;
      case 'SHOW_FEATURED':
        domainQueryObj = domainQueryObj.find({
          isFeatured: true,
        });
        break;
      case 'SHOW_REGISTERED':
        domainQueryObj = domainQueryObj.find({
          isRegistered: true,
        });
        break;
      default:
        break;
    }
    // searchOptions.contains
    console.log(queryDomainDto.searchOptions.contains);
    if (queryDomainDto.searchOptions.contains?.length > 0) {
      addQuery(domainQueryObj, {
        name: new RegExp('(.*' + queryDomainDto.searchOptions.contains + '.*)'),
      });
    }

    // searchOptions.startWith
    if (queryDomainDto.searchOptions.startWith?.length > 0) {
      addQuery(domainQueryObj, {
        name: new RegExp('^' + queryDomainDto.searchOptions.startWith),
      });
    }
    // console.log(await this.domainModel.findOne({ name: /^0123/ }).exec());

    // searchOptions.endWith
    if (queryDomainDto.searchOptions.endWith?.length > 0) {
      domainQueryObj = domainQueryObj.find({
        name: new RegExp('^' + queryDomainDto.searchOptions.endWith),
      });
    }
    const lengthExpr: any = {};

    // searchOptions.minLength
    if (queryDomainDto.searchOptions.minLength > 0) {
      addQuery(domainQueryObj, {
        name: new RegExp(
          `^[\\s\\S]{${queryDomainDto.searchOptions.minLength},}$`,
        ),
      });
    }

    // ^[\s\S]{40,}$
    // searchOptions.maxLength
    if (queryDomainDto.searchOptions.maxLength > 0) {
      lengthExpr.$expr = {
        $lte: [{ $strLenCP: '$name' }, queryDomainDto.searchOptions.maxLength],
      };
    }
    if (lengthExpr.$expr || lengthExpr.name)
      domainQueryObj = domainQueryObj.find(lengthExpr);

    const priceFilter: any = {};
    // searchOptions.minPrice
    if (queryDomainDto.searchOptions.minPrice > 0) {
      priceFilter.$gte = queryDomainDto.searchOptions.minPrice;
    }

    // searchOptions.maxPrice
    if (queryDomainDto.searchOptions.maxPrice > 0) {
      priceFilter.$lte = queryDomainDto.searchOptions.maxPrice;
    }
    if (priceFilter.$gte || priceFilter.$lte)
      domainQueryObj = domainQueryObj.find({ price: priceFilter });

    // advancedFilterValues
    queryDomainDto.advancedFilterValues.forEach((filter) => {
      switch (filter) {
        case 'HYPEN_YES':
          addQuery(domainQueryObj, {
            name: /.*[-].*/,
          });
          break;
        case 'HYPEN_NO':
          addQuery(domainQueryObj, {
            name: { $not: /.*[-].*/ },
          });
          break;
        case 'LETTERS_YES':
          addQuery(domainQueryObj, { name: /.*[a-zA-Z].*/ });
          break;
        case 'LETTERS_NO':
          addQuery(domainQueryObj, { name: { $not: /.*[a-zA-Z].*/ } });
          break;
        case 'NUMBERS_YES':
          addQuery(domainQueryObj, { name: /.*[0-9].*/ });
          break;
        case 'NUMBERS_NO':
          addQuery(domainQueryObj, { name: { $not: /.*[0-9].*/ } });
          break;
        case 'PALINDROMES_YES':
          domainQueryObj = domainQueryObj.find({ isPalindromes: true });
          break;
        case 'PALINDROMES_NO':
          domainQueryObj = domainQueryObj.find({ isPalindromes: false });
          break;
        default:
          break;
      }
    });

    // sortOption
    const _copiedDomainQueryObj = domainQueryObj.clone();
    const count = await _copiedDomainQueryObj.count();

    // searchOptions.offset
    if (queryDomainDto.searchOptions.offset)
      domainQueryObj = domainQueryObj.skip(
        queryDomainDto.searchOptions.offset *
          queryDomainDto.searchOptions.pageSize,
      );
    // searchOptions.pageSize
    domainQueryObj = domainQueryObj.limit(
      queryDomainDto.searchOptions.pageSize,
    );
    switch (queryDomainDto.sortOption) {
      case 'PRICE_ASC':
        domainQueryObj = domainQueryObj.sort({ price: 1 });
        break;
      case 'PRICE_DESC':
        domainQueryObj = domainQueryObj.sort({ price: -1 });
        break;
      case 'NAME_ASC':
        domainQueryObj = domainQueryObj.sort({ name: 1 });
        break;
      case 'NAME_DESC':
        domainQueryObj = domainQueryObj.sort({ name: -1 });
        break;
      case 'LASTSOLDAMOUNT_ASC':
        domainQueryObj = domainQueryObj.sort({ lastSoldAmount: 1 });
        break;
      case 'LASTSOLDAMOUNT_DESC':
        domainQueryObj = domainQueryObj.sort({ lastSoldAmount: -1 });
        break;
      case 'TOKENID_ASC':
        domainQueryObj = domainQueryObj.sort({ tokenId: 1 });
        break;
      case 'TOKENID_DESC':
        domainQueryObj = domainQueryObj.sort({ tokenId: -1 });
        break;
      case 'EXPIRESAT_ASC':
        domainQueryObj = domainQueryObj.sort({ expiresAt: 1 });
        break;
      case 'EXPIRESAT_DESC':
        domainQueryObj = domainQueryObj.sort({ expiresAt: -1 });
        break;
      default:
        break;
    }

    console.log(domainQueryObj.getQuery());

    return { count, domains: await domainQueryObj.exec() };
  }
}
