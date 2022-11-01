import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MS_PER_DAY, TEZOS_COLLECTION_IDS } from 'src/helpers/constants';

import { QueryDomainDto, UpdateDomainDto } from './dto/domain.dto';
import { Domain, DomainDocument } from './schema/domain.schema';
import { Profile, ProfileDocument } from './schema/profile.schema';
import fetch from 'node-fetch';
import { Setting, SettingDocument } from './schema/settings.schema';
@Injectable()
export class DomainService {
  constructor(
    @InjectModel(Domain.name)
    private readonly domainModel: Model<DomainDocument>,
    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,
    @InjectModel(Setting.name)
    private readonly settingModel: Model<SettingDocument>,
  ) {}

  async testFunction() {
    // const _profile = await this.profileModel
    //   .findOne({ address: 'ASDF' })
    //   .exec();
    // if (_profile) {
    //   return _profile;
    // }
    // return await this.profileModel.create({ address: 'ASDF' });
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

  async getDomainsByCollectionId(
    collectionId: string,
  ): Promise<DomainDocument[]> {
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
    ) {
      updateDomainDto.tags.push('palindromes');
      updateDomainDto.tags = Array.from(new Set(updateDomainDto.tags));
      updateDomainDto.isPalindromes = true;
    } else updateDomainDto.isPalindromes = false;

    if (updateDomainDto.name.indexOf('-') >= 0) {
      updateDomainDto.collectionId = TEZOS_COLLECTION_IDS['HYPEN'];
      // console.log(updateDomainDto);
    } else if (
      parseInt(updateDomainDto.name).toString() == updateDomainDto.name
    ) {
    } else if (/\d/.test(updateDomainDto.name)) {
    } else if (updateDomainDto.name.length === 3)
      updateDomainDto.collectionId = TEZOS_COLLECTION_IDS['3LD'];
    else if (updateDomainDto.name.length === 4)
      updateDomainDto.collectionId = TEZOS_COLLECTION_IDS['4LD'];
    else if (updateDomainDto.name.length === 5)
      updateDomainDto.collectionId = TEZOS_COLLECTION_IDS['5LD'];

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
      {
        seconds: 0, // 30 days
      },
    ];
    const result: Domain[][] = await Promise.all(
      durations.map((item) => {
        if (item.seconds === 0)
          return this.domainModel
            .find({})
            .sort({ lastSoldAmount: -1 })
            .limit(5)
            .exec();
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
  async getDomainByName(
    name: string,
    tokenId: number = 0,
    isRegistered: boolean = false,
    owner: string = '',
  ): Promise<DomainDocument> {
    let _domain = await this.domainModel.findOne({ name }).exec();
    if (_domain === null) {
      _domain = new this.domainModel({ name, tokenId, isRegistered, owner });
    }
    return _domain;
  }
  async getDomainHoldingByAddress(address: string): Promise<number> {
    return await this.domainModel.findOne({ owner: address }).count();
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

    if (queryDomainDto.searchOptions.isForAuction === true) {
      domainQueryObj = domainQueryObj.find({
        isForAuction: true,
        auctionEndsAt: { $gt: new Date() },
      });
    } else if (queryDomainDto.searchOptions.isForSale === true) {
      domainQueryObj = domainQueryObj.find({
        isForSale: true,
        saleEndsAt: { $gt: new Date() },
      });
    }

    // searchOptions.domainListed
    else {
      if (queryDomainDto.searchOptions.domainListed === true)
        domainQueryObj = domainQueryObj.find({
          $or: [{ isForAuction: true }, { isForSale: true }],
        });
      else if (queryDomainDto.searchOptions.domainListed === false) {
        domainQueryObj = domainQueryObj.find({
          $and: [{ isForAuction: false }, { isForSale: false }],
        });
      }
    }

    // searchOptions.isRegistered
    if (queryDomainDto.searchOptions.isRegistered === true)
      domainQueryObj = domainQueryObj.find({
        tokenId: { $gt: 1 },
      });
    else if (queryDomainDto.searchOptions.isRegistered === false) {
      domainQueryObj = domainQueryObj.find({
        tokenId: { $not: { $gt: 1 } },
      });
    }
    // searchOptions.isExpiring
    if (queryDomainDto.searchOptions.isExpiring === true)
      domainQueryObj = domainQueryObj.find({
        expiresAt: { $lt: new Date(new Date().getTime() + MS_PER_DAY * 15) },
      });
    else if (queryDomainDto.searchOptions.isExpiring === false) {
      domainQueryObj = domainQueryObj.find({
        expiresAt: { $lt: new Date() },
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

    // searchOptions.owner
    if (queryDomainDto.searchOptions.owner?.length > 0) {
      domainQueryObj = domainQueryObj.find({
        owner: queryDomainDto.searchOptions.owner,
      });
    }

    // searchOptions.collectionId
    if (queryDomainDto.searchOptions.collectionId?.length > 0) {
      domainQueryObj = domainQueryObj.find({
        collectionId: queryDomainDto.searchOptions.collectionId,
      });
    }

    // searchOptions.contains
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

    // sortOption
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

      case 'SALESTARTEDAT_ASC':
        domainQueryObj = domainQueryObj.sort({ saleStartedAt: 1 });
        break;
      case 'SALESTARTEDAT_DESC':
        domainQueryObj = domainQueryObj.sort({ saleStartedAt: -1 });
        break;
      case 'SALEENDSAT_ASC':
        domainQueryObj = domainQueryObj.sort({ saleEndsAt: 1 });
        break;
      case 'SALEENDSAT_DESC':
        domainQueryObj = domainQueryObj.sort({ saleEndsAt: -1 });
        break;

      case 'AUCTIONSTARTEDAT_ASC':
        domainQueryObj = domainQueryObj.sort({ auctionStartedAt: 1 });
        break;
      case 'AUCTIONSTARTEDAT_DESC':
        domainQueryObj = domainQueryObj.sort({ auctionStartedAt: -1 });
        break;
      case 'AUCTIONENDSAT_ASC':
        domainQueryObj = domainQueryObj.sort({ auctionEndsAt: 1 });
        break;
      case 'AUCTIONENDSAT_DESC':
        domainQueryObj = domainQueryObj.sort({ auctionEndsAt: -1 });
        break;

      default:
        break;
    }

    console.log(domainQueryObj.getQuery());

    return { count, domains: await domainQueryObj.exec() };
  }

  // generate 10k collection
  async createCollection() {
    // await this.domainModel
    //   .deleteMany({
    //     name: /.tez$/,
    //   })
    //   .exec();
    // return;
    const domainNames: string[] = [];
    const collectionId = new Types.ObjectId('633b35c2965d76ae5e25bb81');
    for (let i = 0; i < 100000; i++) domainNames.push(`${i}`.padStart(5, '0'));

    const batchCnt = 10;
    for (let i = 0; i < domainNames.length; i += batchCnt) {
      const numArr = Array.from({ length: batchCnt }, (_, _i) => _i + i);

      const domains = await Promise.all(
        numArr.map((index) => this.getDomainByName(domainNames[index])),
      );
      const names = numArr.map((index) => `${domainNames[index]}.tez`);
      console.log(JSON.stringify(names));

      const result = await fetch('https://api.tezos.domains/graphql', {
        headers: {
          accept: '*/*, application/json',
          'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
          'content-type': 'application/json',
          'sec-ch-ua':
            '"Chromium";v="106", "Google Chrome";v="106", "Not;A=Brand";v="99"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          Referer: 'https://api.tezos.domains/playground',
          'Referrer-Policy': 'same-origin',
        },
        body: `{"operationName":null,"variables":{},"query":"{\\n  domains(where: {name: {in: ${JSON.stringify(
          names,
        ).replace(
          /"/g,
          `\\"`,
        )} }}) {\\n    totalCount\\n    items {\\n      name\\n      owner\\n      tokenId\\n      expiresAtUtc\\n      lastAuction {\\n        endsAtUtc\\n        highestBid {\\n          amount\\n        }\\n      }\\n    }\\n    pageInfo {\\n      hasNextPage\\n      endCursor\\n      startCursor\\n    }\\n  }\\n}\\n"}`,
        method: 'POST',
      });
      const domainObjs = (await result.json()).data.domains.items;
      // console.log(domainObjs);
      // const domainObj = (await result.json()).data.domains.items;
      names.forEach((name, index) => {
        const domain = domains[index];
        const domainObj = domainObjs.find(
          (item) => item.name === `${domain.name}.tez`,
        );
        domain.collectionId = collectionId;

        if (domainObj) {
          domain.isRegistered = true;
          domain.owner = domainObj.owner;
          domain.isPalindromes =
            domain.name === domain.name.split('').reverse().join('');
          domain.expiresAt = new Date(domainObj.expiresAtUtc);
          domain.tokenId = domainObj.tokenId;
          domain.lastSoldAmount =
            domainObj.lastAuction?.highestBid?.amount || 0;
          domain.lastSoldAt = new Date(
            domainObj.lastAuction?.endsAtUtc || new Date(0),
          );
        } else {
          domain.isRegistered = false;
          domain.tokenId = -1;
        }
        // console.log(domain.name, domainObj?.name, domainObj?.owner);
        domain.save();
      });
    }
  }
  async updateByCollection(collectionId: string) {
    const domains: DomainDocument[] = await this.getDomainsByCollectionId(
      collectionId,
    );
    console.log(domains.length);
    let cnt = 0;
    domains.forEach(async (domain) => {
      const result = await fetch('https://api.tezos.domains/graphql', {
        headers: {
          accept: '*/*, application/json',
          'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
          'content-type': 'application/json',
          'sec-ch-ua':
            '"Chromium";v="106", "Google Chrome";v="106", "Not;A=Brand";v="99"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          Referer: 'https://api.tezos.domains/playground',
          'Referrer-Policy': 'same-origin',
        },
        body: `{\"operationName\":null,\"variables\":{},\"query\":\"{\\n  domain(name: \\\"${domain.name}.tez\\\") {\\n    owner\\n    name\\n    reverseRecord {\\n      address\\n    }\\n    expiresAtUtc\\n    tokenId\\n    operators {\\n      address\\n    }\\n    lastAuction {\\n      highestBid {\\n        amount\\n      }\\n      endsAtUtc\\n    }\\n  }\\n}\\n\"}`,
        method: 'POST',
      });
      const domainObj = (await result.json()).data.domain;
      if (domainObj) {
        domain.isRegistered = true;
        domain.owner = domainObj.owner;
        domain.isPalindromes =
          domain.name === domain.name.split('').reverse().join('');
        domain.expiresAt = new Date(domainObj.expiresAtUtc);
        domain.tokenId = domainObj.tokenId;
        domain.lastSoldAmount = domainObj.lastAuction?.highestBid?.amount || 0;
        domain.lastSoldAt = new Date(
          domainObj.lastAuction?.endsAtUtc || new Date(0),
        );
      } else {
        domain.isRegistered = false;
        domain.tokenId = -1;
      }
      domain.save();
      console.log(
        `${++cnt} / ${domains.length}`,
        domain.name,
        domain.isRegistered,
      );
    });
  }

  async fetchNewDomains() {
    // await this.settingModel.create({});
    const setting = await this.settingModel.findOne().exec();
    const result = await fetch('https://data.objkt.com/v3/graphql', {
      headers: {
        accept: 'application/json',
        'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
        'content-type': 'application/json',
        'sec-ch-ua':
          '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        cookie: 'ai_user=QPsH+kLj3D18rTkDqD8Ut8|2022-09-22T05:55:26.464Z',
        Referer: 'https://data.objkt.com/explore/',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
      body: `{\"query\":\"query MyQuery {\\n  token(\\n    where: {fa_contract: {_eq: \\\"KT1GBZmSxmnKJXGMdMLbugPfLyUPmuLSMwKS\\\"}, pk: {_gt: ${setting.lastPk}}}\\n    order_by: {pk: asc}\\n  ) {\\n    name\\n    token_id\\n    pk\\n    holders {\\n      holder_address\\n    }\\n  }\\n}\\n\",\"variables\":null,\"operationName\":\"MyQuery\"}`,
      method: 'POST',
    });
    const tokens: {
      name: string;
      token_id: number;
      pk: number;
      holders: { holder_address: string }[];
    }[] = (await result.json()).data.token;
    tokens.forEach((token) => {
      this.getDomainByName(
        token.name.replace('.tez', ''),
        token.token_id,
        true,
        token.holders[0].holder_address,
      ).then((domain) => {
        if (domain.name === domain.name.split('').reverse().join('')) {
          domain.tags.push('palindromes');
          domain.tags = Array.from(new Set(domain.tags));
          domain.isPalindromes = true;
        } else domain.isPalindromes = false;

        if (domain.name.indexOf('-') >= 0) {
          domain.collectionId = new Types.ObjectId(
            TEZOS_COLLECTION_IDS['HYPEN'],
          );
          // console.log(domain);
        } else if (parseInt(domain.name).toString() == domain.name) {
        } else if (/\d/.test(domain.name)) {
        } else if (
          domain.collectionId ==
          new Types.ObjectId(TEZOS_COLLECTION_IDS['COUNTRIES'])
        ) {
        } else if (domain.name.length === 3)
          domain.collectionId = new Types.ObjectId(TEZOS_COLLECTION_IDS['3LD']);
        else if (domain.name.length === 4)
          domain.collectionId = new Types.ObjectId(TEZOS_COLLECTION_IDS['4LD']);
        else if (domain.name.length === 5)
          domain.collectionId = new Types.ObjectId(TEZOS_COLLECTION_IDS['5LD']);

        domain.save();
      });
    });

    if (tokens.at(-1)) {
      setting.lastPk = tokens.at(-1).pk;
      setting.save();
    }

    return tokens;
  }
}
/*
query MyQuery {
  token(
    where: {fa_contract: {_eq: "KT1GBZmSxmnKJXGMdMLbugPfLyUPmuLSMwKS"}}
    order_by: {pk: asc}
  ) {
    name
    token_id
    timestamp
    pk
  }
}

*/
