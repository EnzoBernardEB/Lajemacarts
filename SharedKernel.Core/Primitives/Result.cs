namespace SharedKernel.Core.Primitives;

public class Result
{

  protected Result(bool isSuccess, Error error)
  {
    if (isSuccess && error != Error.None ||
        !isSuccess && error == Error.None)
      throw new ArgumentException("Invalid error combination for result status.", nameof(error));
    IsSuccess = isSuccess;
    Error = error;
  }

  public bool IsSuccess { get; }

  public bool IsFailure => !IsSuccess;

  public Error Error { get; }

  public static Result Success()
  {
    return new Result(true, Error.None);
  }

  public static Result Failure(Error error)
  {
    return new Result(false, error);
  }

  public static Result NotFound(Error error)
  {
    return Failure(error);
  }

  public static Result ValidationError(Error error)
  {
    return Failure(error);
  }
}

public class Result<TValue> : Result
{
  private readonly TValue? _value;

  private Result(bool isSuccess, TValue? value, Error error)
      : base(isSuccess, error)
  {
    _value = value;
  }

  public TValue Value => IsSuccess
      ? _value!
      : throw new InvalidOperationException("The value of a failure result cannot be accessed.");

  public static Result<TValue> Success(TValue value)
  {
    return new Result<TValue>(true, value, Error.None);
  }

  public new static Result<TValue> Failure(Error error)
  {
    return new Result<TValue>(false, default, error);
  }

  public static implicit operator Result<TValue>(TValue value)
  {
    return Success(value);
  }

  public static implicit operator Result<TValue>(Error error)
  {
    return Failure(error);
  }
}