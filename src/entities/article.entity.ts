import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Category } from "./category.entity";
import { ArticleFeature } from "./article-feature.entity";
import { ArticlePrice } from "./article-price.entity";
import { CartArticle } from "./cart-article.entity";
import { Photo } from "./photo.entity";
import { Documentation } from "./documentation.entity";
import { Feature } from "./feature.entity";

@Index("fk_article_category_id_idx", ["categoryId"], {})
@Entity("article")

export class Article {
  @PrimaryGeneratedColumn({ type: "int", name: "article_id", unsigned: true })
  articleId: number;

  @Column({ type: "varchar", length: 128 })
  name: string;

  @Column({ type: "int", name: "category_id", unsigned: true })
  categoryId: number;

  @Column({ type: "varchar", length: 255 })
  excerpt: string;

  @Column({ type: "text" })
  description: string;

  @Column({
    type: "enum",
    enum: ["available", "visible", "hidden"],
    default: () => "'available'",
  })
  status: "available" | "visible" | "hidden";

  @Column({ 
    type: "tinyint", 
    name: "is_promoted", 
    unsigned: true 
  })
  isPromoted: number;

  @Column({
    type: "timestamp",
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  //relacija vise prema 1 od artikla ka kategoriji
  @ManyToOne(
    () => Category, 
    (category) => category.articles, 
    { onDelete: "RESTRICT", onUpdate: "CASCADE",}
  )
  @JoinColumn([{ name: "category_id", referencedColumnName: "categoryId" }])
  category: Category;

  @OneToMany(
    () => ArticleFeature, 
    articleFeature => articleFeature.article
  )
  articleFeatures: ArticleFeature[]; //vrednosti feature-a

  @ManyToMany(type => Feature, feature => feature.articles)
  @JoinTable({
    name: "article_feature",
    joinColumn: { name: "article_id", referencedColumnName: "articleId" },
    inverseJoinColumn: {name: "feature_id", referencedColumnName: "featureId" }
  })
  features: Feature[]; //svi feature-i kako se zovu i o njima detaljnije

  @OneToMany(() => ArticlePrice, 
    articlePrice => articlePrice.article
  )
  articlePrices: ArticlePrice[];

  @OneToMany(() => CartArticle,
  cartArticle => cartArticle.article
  )
  cartArticles: CartArticle[];

  @OneToMany(() => Photo, 
  (photo) => photo.article
  )
  photos: Photo[];

  @OneToMany(() => Documentation, 
  (documentation) => documentation.article
  )
  documentations: Documentation[];
}