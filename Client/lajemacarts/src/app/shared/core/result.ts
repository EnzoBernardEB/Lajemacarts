import {DomainError} from './error.model';

export class Result<T> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  public readonly error: DomainError | null;
  private readonly _value: T | null;

  private constructor(isSuccess: boolean, error?: DomainError | null, value?: T | null) {
    if (isSuccess && error) {
      throw new Error("Opération invalide : Un résultat ne peut pas être un succès et contenir une erreur.");
    }
    if (!isSuccess && !error) {
      throw new Error("Opération invalide : Un résultat en échec doit contenir une erreur.");
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error || null;
    this._value = value || null;
  }

  public getValue(): T {
    if (!this.isSuccess) {
      console.error(this.error);
      throw new Error("Impossible d'obtenir la valeur d'un résultat en échec.");
    }
    return this._value!;
  }

  public static success<U>(value: U): Result<U> {
    return new Result<U>(true, null, value);
  }

  public static failure<U>(error: DomainError): Result<U> {
    return new Result<U>(false, error);
  }


  public static combine(results: Result<unknown>[]): Result<void> {
    for (const result of results) {
      if (result.isFailure) {
        return Result.failure<void>(result.error!);
      }
    }

    return Result.success<void>(undefined as void);
  }
}
