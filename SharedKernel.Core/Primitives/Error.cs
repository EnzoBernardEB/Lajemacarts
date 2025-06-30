namespace SharedKernel.Core.Primitives;

public sealed record Error(string Code, string? Description = null)
{
  public static readonly Error None = new Error(string.Empty);

  public static implicit operator Result(Error error)
  {
    return Result.Failure(error);
  }
}