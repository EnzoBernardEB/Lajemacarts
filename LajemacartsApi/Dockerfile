FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

COPY ["LajemacartsApi.sln", "."]
COPY ["LajemacartsApi/LajemacartsApi.csproj", "LajemacartsApi/"]
COPY ["GalleryContext.PrimaryAdapters/GalleryContext.PrimaryAdapters.csproj", "GalleryContext.PrimaryAdapters/"]
COPY ["GalleryContext.SecondaryAdapters/GalleryContext.SecondaryAdapters.csproj", "GalleryContext.SecondaryAdapters/"]
COPY ["GalleryContext.BusinessLogic/GalleryContext.BusinessLogic.csproj", "GalleryContext.BusinessLogic/"]

RUN dotnet restore "LajemacartsApi.sln"

COPY . .

WORKDIR "/src/LajemacartsApi"
RUN dotnet publish "LajemacartsApi.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 80
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "LajemacartsApi.dll"]