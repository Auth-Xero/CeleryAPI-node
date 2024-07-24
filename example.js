const { inject, execute } = require('./api');

inject().then(status => {
    console.log('Injection status:', status);
    if (status === 'SUCCESS') {
        const source = `
        local player = game.Players.LocalPlayer
        local character = player.Character or player.CharacterAdded:Wait()
        local humanoidRootPart = character:WaitForChild("HumanoidRootPart")

        local teleportDistance = 100

        local function teleportUpwards()
            local currentPosition = humanoidRootPart.Position
            local newPosition = currentPosition + Vector3.new(0, teleportDistance, 0)
            
            humanoidRootPart.CFrame = CFrame.new(newPosition)
        end
        teleportUpwards()
        `;
        execute(source);
    } else {
        console.error('Injection failed, cannot execute the source.');
    }
}).catch(err => {
    console.error('Error during injection:', err);
});
