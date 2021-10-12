import Command from './Command';
import PingCommand from './PingCommand';
import AddUserCommand from './AddUserCommand';
import GetCommand from './GetCommand';

class Commands {
    static commands: Command[] = [
        new PingCommand(),
        new AddUserCommand(),
        new GetCommand(),
    ];
}

export default Commands.commands as Command[];
