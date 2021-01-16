import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import * as Validator from "class-validator";

@Index("uq_administrator_username", ["username"], { unique: true })
@Entity("administrator")
export class Administrator {
  @PrimaryGeneratedColumn({
    type: "int",
    name: "administrator_id",
    unsigned: true,
  })
  administratorId: number;

  @Column({
     type: "varchar",
     unique: true,
     length: 32
  })
  @Validator.IsNotEmpty()  //ne sme da bude prazan
  @Validator.IsString()
  @Validator.Matches(/^[a-z][a-z0-9\.]{3,30}[a-z0-9]$/) //prvi je obavezno slovo(a-z) i poslednji obavezno broj ili slovo
  username: string;

  @Column({
    type: "varchar",
    name: "password_hash",
    length: 128
  })
  @Validator.IsNotEmpty()
  @Validator.IsHash('sha512')
  passwordHash: string;
}
