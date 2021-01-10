import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from "typeorm";
  import { Article } from "./article.entity";
  
  @Index("uq_documentation_pdf_path", ["pdfPath"], { unique: true })
  @Index("fk_documentation_article_id", ["articleId"], {})
  @Entity("documentation")
  export class Documentation {
    @PrimaryGeneratedColumn({ type: "int", name: "documentation_id", unsigned: true })
    documentationId: number;
  
    @Column({ type: "int", name: "article_id", unsigned: true })
    articleId: number;
  
    @Column({ type: "varchar", name: "pdf_path", unique: true, length: 128 })
    pdfPath: string;
  
    //vise dokumentacija moze pripadati jednom artiklu
    @ManyToOne(
      () => Article, 
      article => article.documentations, 
      { onDelete: "RESTRICT", onUpdate: "CASCADE" }
    )
    @JoinColumn([{ name: "article_id", referencedColumnName: "articleId" }])
    article: Article;
  }
  