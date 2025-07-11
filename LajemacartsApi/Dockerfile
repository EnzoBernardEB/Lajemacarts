FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ENV DOTNET_SDK_VERSION=9.0.205
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

COPY ["Lajemacarts.sln", "."]
COPY ["global.json", "."]
COPY ["Common.targets", "."]
COPY ["LajemacartsApi/", "LajemacartsApi/"]
COPY ["GalleryContext.PrimaryAdapters/", "GalleryContext.PrimaryAdapters/"]
COPY ["GalleryContext.SecondaryAdapters/", "GalleryContext.SecondaryAdapters/"]
COPY ["GalleryContext.BusinessLogic/", "GalleryContext.BusinessLogic/"]
COPY ["SharedKernel.Core/", "SharedKernel.Core/"]
COPY ["GalleryContext.BusinessLogic.UnitTests/", "GalleryContext.BusinessLogic.UnitTests/"]
COPY ["GalleryContext.SecondaryAdapters.IntegrationTests/", "GalleryContext.SecondaryAdapters.IntegrationTests/"]
COPY ["GalleryContext.PrimaryAdapters.EndToEndTests/", "GalleryContext.PrimaryAdapters.EndToEndTests/"]
COPY ["SharedKernel.DatabaseTests/", "SharedKernel.DatabaseTests/"]

RUN dotnet restore "Lajemacarts.sln"

WORKDIR "/src/LajemacartsApi"
RUN dotnet publish "LajemacartsApi.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 80
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "LajemacartsApi.dll"]