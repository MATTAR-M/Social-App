import { QueryOptions, UpdateQuery } from "mongoose";
import { Types } from "mongoose";
import { PopulateOptions } from "mongoose";
import {
  HydratedDocument,
  ObjectId,
  ProjectionType,
  QueryFilter,
} from "mongoose";
import { Model } from "mongoose";
import { AppError } from "../../common/utils/globalErrorHandling";

abstract class BaseRepo<TDocument> {
  constructor(protected readonly model: Model<TDocument>) {}

  async create(data: Partial<TDocument>): Promise<HydratedDocument<TDocument>> {
    return await this.model.create(data);
  }
  async findById(id: ObjectId): Promise<HydratedDocument<TDocument> | null> {
    return this.model.findById(id);
  }
  async findOne({
    filter,
    projection,
    options,
  }: {
    filter: QueryFilter<TDocument>;
    projection?: ProjectionType<TDocument>;
    options?: QueryOptions<TDocument>;
  }): Promise<HydratedDocument<TDocument> | null> {
    return await this.model.findOne(filter, projection);
  }
  async find({
    filter,
    projection,
    options,
  }: {
    filter: QueryFilter<TDocument>;
    projection?: ProjectionType<TDocument>;
    options?: QueryOptions<TDocument>;
  }): Promise<HydratedDocument<TDocument>[] | []> {
    return this.model
      .find(filter, projection)
      .sort(options?.sort)
      .skip(options?.skip!)
      .limit(options?.limit!)
      .populate(options?.populate as PopulateOptions);
  }
  async findByIdAndUpdate({
    id,
    update,
    options,
  }: {
    id: Types.ObjectId;
    update: UpdateQuery<TDocument>;
    options?: QueryOptions<TDocument>;
  }): Promise<HydratedDocument<TDocument> | null> {
    return this.model.findByIdAndUpdate(id, update, {
      new: true,
      ...options,
    });
  }
  async findOneAndUpdate({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<TDocument>;
    update: UpdateQuery<TDocument>;
    options?: QueryOptions<TDocument>;
  }): Promise<HydratedDocument<TDocument> | null> {
    return this.model.findOneAndUpdate(filter, update, {
      new: true,
      ...options,
    });
  }
  async findOneAndDelete({
    filter,
    options,
  }: {
    filter: QueryFilter<TDocument>;
    options?: QueryOptions<TDocument>;
  }): Promise<HydratedDocument<TDocument> | null> {
    return this.model.findOneAndDelete(filter, {
      new: true,
      ...options,
    });
  }
  async paginate<T>({
    page,
    limit,
    sort,
    populate,
    search,
  }: {
    page?: number;
    limit?: number;
    sort?: any;
    populate?: any;
    search?: QueryFilter<T>;
  }) {
    page = +page! || 1;
    limit = +limit! || 1;
    if (page < 1) page = 1;
    if (limit < 1) limit = 1;

    const skip = (page - 1) * limit;
    const [data, totalDocs] = await Promise.all([
      await this.model
        .find({ ...(search ?? {}) })
        .limit(limit)
        .skip(skip)
        .sort(sort)
        .populate(populate)
        .exec(),
      await this.model.countDocuments({ ...(search ?? {}) }),
    ]);
    const totalPages = Math.ceil(totalDocs / limit)
    return {
      meta: { currentPage: page, limit, totalDocs, totalPages },
      data,
    };
  }
}
export default BaseRepo;
